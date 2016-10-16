export default function getComponentHandler(thisObj, handler) {
  return (e) => {
    let newValue = e.target.value;
    const { entity, execute } = thisObj.props;
    execute.apply(null, handler(entity, newValue));
  };
}
