class InputFocusCycler {
  constructor(elems, keycode) {
    this.elems = elems
    this.keycode = keycode
    this.currentFocus = 0
    this.elementAmount = elems.length
  }
  
  cycleIndex() {
    this.currentFocus =
      (this.currentFocus + 1) % this.elementAmount
  }
  cycle(keydownEvent) {
    if(keydownEvent.which === this.keycode) {
      this.cycleIndex()
      this.elems[this.currentFocus].focus()
    }
  }
  setIndex(focusEvent) {
    this.currentFocus = this.elems.indexOf(focusEvent.target)
  }
  
  applyCycling() {
    const that = this
    this.elems.forEach(input => {
      input.addEventListener('keydown', that.cycle.bind(that))
      input.addEventListener('focus', that.setIndex.bind(that))
    })
  }
}
