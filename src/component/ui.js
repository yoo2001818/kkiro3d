import { signalRaw } from 'fudge';

export default {
  actions: {
    setModal: signalRaw(function ([modal]) {
      this.systems.ui.modal = modal;
    }),
    closeModal: function () {
      this.actions.ui.setModal(null);
    }
  }
};
