class DomVuShaker {
  constructor (shakeConfig, monitorConfig) {
    this.config = {
      targetDom: shakeConfig.targetDom || null,
      shakeThreshold: shakeConfig.shakeThreshold || [70,120],
      shakeScale: shakeConfig.shakeScale || 2,
      active: shakeConfig.active || true
    }
    this.monitor = {
      dom: monitorConfig.dom,
      property: monitorConfig.property || 'innerText',
      unit: monitorConfig.unit || '%'
    }
    this.vu = 0
    
    if (this.config.targetDom) {
      DomVuShaker.makeDomShiftable(this.config.targetDom)
    }
  }
  
  set vu (value) {
    // const maximumValue = 200 // I tried blowing my mic really hard
    const percentValue = value * 0.5 // ( value / maximumValue=200 ) * 100
    this.monitor.dom.style[this.monitor.property] = '' + percentValue + this.monitor.unit
  }
  
  static isShiftable (element) {
    const elementPosition = getComputedStyle(element).position
    const shiftablePositions = ['absolute', 'fixed', 'relative']
    
    return shiftablePositions.some(v => v === elementPosition)
  }
  static makeDomShiftable (dom) {
    const targetIsShiftable = DomVuShaker.isShiftable(dom)
    if (!targetIsShiftable)
      dom.style.setProperty('position', 'relative')
  }
  
  shiftTarget (x, y) {
    const target = this.config.targetDom
    if (typeof x === 'undefined') x = 0
    if (typeof y === 'undefined') y = 0
    target.style.left = x + 'px'
    target.style.top = y + 'px'
    // target.style.setProperty('left', x)
    // target.style.setProperty('top', y)
  }
  
  shakeCallback (vu) {
    // get the intensity ratio
    const shakeIntensity = (vu => {
      const threshold = this.config.shakeThreshold
      let ratio = 0
      for (let i = 0; i < threshold.length; i++) {
        ratio += vu > threshold[i]
      }
      return ratio
    })(vu)
    
    // check if it doesn't need to shake
    if (shakeIntensity === 0) this.shiftTarget()
    else {
      // calculate the amount to move the dom
      const shiftAmount = [
        this.config.shakeScale * shakeIntensity * ( Math.random() - 0.5 ),
        this.config.shakeScale * shakeIntensity * ( Math.random() - 0.5 )
      ]
      this.shiftTarget(...shiftAmount)
    }
  }
  
  applyShaking () {
    // copied and modified the code
    // Travis Holliday's 'VU Meter from Mic Input':
    // https://codepen.io/travisholliday/pen/gyaJk
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    
    if (!navigator.getUserMedia) {
      document.write(`getUserMedia not supported`)
      return
    }
    
    navigator.getUserMedia({
      audio: true
    }, stream => {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)
      
      analyser.smoothingTimeConstant = 0.8
      analyser.fftSize = 1024
      
      microphone.connect(analyser)
      analyser.connect(javascriptNode)
      javascriptNode.connect(audioContext.destination)
      
      javascriptNode.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(array)
        let values = 0
        
        const length = array.length
        for (let i = 0; i < length; i++) {
          values += (array[i])
        }
        
        let average = Math.round(values / length)
        
        this.vu = average
        this.shakeCallback(average)
      } // end fn stream
    }, err => {
      if (err.name === 'NotAllowedError') {
        document.write(
          'your streaming software doesn\'t allow this webpage to access your mic.\n' +
          'if you\'re using OBS, try running OBS with the flag `--enable-media-stream`?'
        )
      } else {
        document.write(`The following error occured: ${err.name}`)
      }
    })
  }
}
