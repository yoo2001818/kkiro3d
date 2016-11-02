export default function getComponentHandler(thisObj, handler) {
  return (e) => {
    let newValue = e.target.value;
    const { entity, execute } = thisObj.props;
    execute.apply(null, handler(entity, newValue));
  };
}

export function getLocalHandler(thisObj, handler) {
  return (e) => {
    let newValue = e.target.value;
    const { entity, executeLocal } = thisObj.props;
    executeLocal.apply(null, handler(entity, newValue));
  };
}
