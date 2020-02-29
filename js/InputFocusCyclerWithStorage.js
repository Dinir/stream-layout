class InputFocusCyclerWithStorage extends InputFocusCycler {
  constructor(elems, keycode, maxWeeks = 1) {
    super(elems, keycode)
    this.maxWeeks = maxWeeks
    this.loadInputs()
  }
  
  saveInputs() {
    this.elems.forEach(input => {
      window.localStorage.setItem(`input-${input.id}`, input.value)
    })
  }
  
  loadInputs() {
    this.elems.forEach(input => {
      input.value = window.localStorage.getItem(`input-${input.id}`)
    })
  }
  
  applyCycling() {
    super.applyCycling()
    const that = this
    this.elems.forEach(input => {
      input.addEventListener('blur', that.saveInputs.bind(that))
    })
  }
}
