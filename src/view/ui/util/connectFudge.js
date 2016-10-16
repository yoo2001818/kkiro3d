import { Component, PropTypes, Children, createElement } from 'react';
import shallowequal from 'shallowequal';

// Ripped off from https://github.com/reactjs/react-redux then ported to
// support fudge

export class Provider extends Component {
  getChildContext() {
    return { engine: this.props.engine };
  }
  render() {
    return Children.only(this.props.children);
  }
}

Provider.propTypes = {
  engine: PropTypes.object,
  children: PropTypes.element
};

Provider.childContextTypes = {
  engine: PropTypes.object
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

const defaultActionValidations = {};
const defaultStateToProps = () => ({});
const defaultMergeProps = (stateProps, parentProps) =>
  Object.assign({}, parentProps, stateProps);

let VERSION = 0;

export default function connectFudge(
  actionValidations = defaultActionValidations,
  mapStateToProps = defaultStateToProps,
  mergeProps = defaultMergeProps, options = {
    pure: true
  }
) {
  const { pure } = options;
  const version = VERSION ++;

  return function wrapWithConnect(WrappedComponent) {
    const connectDisplayName =
      `ConnectFudge(${getDisplayName(WrappedComponent)})`;
    class Connect extends Component {
      constructor(props, context) {
        super(props, context);
        this.engine = props.engine || context.engine;
        this.version = version;
        // Build action validations tree
        this.validations = {};
        let bindedChange = this.handleChange.bind(this);
        for (let key in actionValidations) {
          let checker = actionValidations[key];
          if (typeof checker === 'function') {
            this.validations[key] =
              (args) => (checker(args, this.props, this.engine) &&
              this.handleChange());
          } else {
            this.validations[key] = bindedChange;
          }
        }
        this.checkUpdate = this.checkUpdate.bind(this);
        this.attached = false;
        // However, we should only really update the component if external
        // actions are received. But we'll see..
        this.stateDependsOnProps = mapStateToProps.length >= 2;
        this.stateChanged = true;
        this.propsChanged = true;
      }
      shouldComponentUpdate() {
        return !pure || this.propsChanged || this.stateChanged;
      }
      attachHooks() {
        if (this.attached) return;
        let hasKey = false;
        for (let key in this.validations) {
          this.engine.attachHook(key, this.validations[key], true);
          hasKey = true;
        }
        if (hasKey) {
          this.engine.attachHook('external.domUpdate:post', this.checkUpdate,
            true);
        }
        this.attached = true;
      }
      detachHooks() {
        if (!this.attached) return;
        let hasKey = false;
        for (let key in this.validations) {
          this.engine.detachHook(key, this.validations[key]);
          hasKey = true;
        }
        if (hasKey) {
          this.engine.detachHook('external.domUpdate:post', this.checkUpdate);
        }
        this.attached = false;
      }
      handleChange() {
        this.stateChanged = true;
      }
      checkUpdate(args) {
        if (this.stateChanged) this.forceUpdate();
        return args;
      }
      componentDidMount() {
        this.attachHooks();
      }
      componentWillReceiveProps(nextProps) {
        if (!shallowequal(this.props, nextProps)) {
          this.propsChanged = true;
        }
      }
      componentWillUnmount() {
        this.detachHooks();
      }
      componentWillUpdate() {
        if (this.version !== version) {
          this.version = version;
          this.propsChanged = true;
        }
      }
      render() {
        let updateState = this.stateChanged ||
          (this.propsChanged && this.stateDependsOnProps);
        let updateMerge = this.stateChanged || this.propsChanged;
        if (updateState) {
          this.stateProps = mapStateToProps(this.engine, this.props);
        }
        if (updateMerge) {
          this.mergeProps = mergeProps(this.stateProps, this.props);
        }
        this.stateChanged = false;
        this.propsChanged = false;
        if (!updateMerge && this.renderedElement) {
          return this.renderedElement;
        }
        this.renderedElement = createElement(WrappedComponent, this.mergeProps);
        return this.renderedElement;
      }
    }
    Connect.propTypes = {
      engine: PropTypes.object
    };
    Connect.contextTypes = {
      engine: PropTypes.object
    };
    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = connectDisplayName;
    return Connect;
  };
}
