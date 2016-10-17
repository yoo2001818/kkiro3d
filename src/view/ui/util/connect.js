import connect from 'react-fudge';

export default function connectFudge(actionValidations, mapStateToProps,
  mergeProps, options = { pure: true }
) {
  return connect(actionValidations, mapStateToProps, mergeProps, {
    pure: options.pure, updateEvent: 'external.domRender:post'
  });
}
