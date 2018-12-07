class CurrentTimeDisplay extends ClockDisplay {
  
  constructor(dom, separator, updateInterval) {
    super(dom, separator)
    this.updateInterval = updateInterval
    this.currentTime = new Date()
    this.intervalID = 0
  }
  
  updateTimeToCurrent() {
    this.currentTime.setTime(Date.now())
    return this.updateTime(
      this.currentTime.getHours(),
      this.currentTime.getMinutes(),
      this.currentTime.getSeconds()
    )
  }
  
  autoUpdate(turningOn) {
    // if the argument is not provided let it toggle the on/off state
    if (typeof turningOn === 'undefined')
      turningOn = !this.intervalID
    // logical XOR!
    // check if 'it's on and you want it off' or 'it's off and you want it off'
    if (!turningOn !== !this.intervalID) {
      // after the check you can assume the argument value by seeing if the ID is zero or not
      if (this.intervalID) {
        clearInterval(this.intervalID)
        this.intervalID = 0
        this.updateTime('--', '--', '--')
      } else {
        this.intervalID = setInterval(
          this.updateTimeToCurrent.bind(this),
          this.updateInterval
        )
      }
    }
    
    return this.intervalID
  }
}
