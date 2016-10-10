export default class BatteryManager {
  constructor() {
    this.mode = 0;
    if (typeof navigator.getBattery === 'function') {
      navigator.getBattery().then(battery => {
        if (battery == null) {
          // Cannot find battery; cancel saving mode
          this.mode = 0;
          return;
        }
        const updateBattery = () => {
          console.log(battery);
          if (!battery.charging) {
            if (battery.level > 0.3) {
              this.mode = 2;
            } else {
              this.mode = 3;
            }
          } else {
            this.mode = 0;
          }
        };
        updateBattery();
        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
      });
    } else {
      // Cannot find battery; cancel saving mode
      this.mode = false;
    }
  }
}
