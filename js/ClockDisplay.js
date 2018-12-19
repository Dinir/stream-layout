class ClockDisplay {
  constructor(dom, separator) {
    this.dom = dom
    this.separator = separator
    this.timeText = Array(3).fill('0'.repeat(2))
  }
  
  updateTime(hours, minutes, seconds) {
    for (let i = 0; i < this.timeText.length; i++) {
      if (typeof arguments[i] === 'undefined') continue
      this.timeText[i] = ('0' + arguments[i]).substr(-2)
    }
    this.dom.innerHTML = this.time
    return this.time
  }
  
  get time() {
    return this.timeText.join(this.separator)
  }
}
