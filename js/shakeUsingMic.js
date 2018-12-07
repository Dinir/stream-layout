const shakeConfig = {
  targetDom: null,
  shakeThreshold: [65,75,85,95,105],
  shakeScale: 2,
  active: true
}

const getTwoRandomNumbers = () => [
  Math.random(), Math.random()
]
const isShiftable = element => {
  const elementPosition = getComputedStyle(element).position
  const shiftablePositions = ['absolute', 'fixed', 'relative']

  return shiftablePositions.some(v => v === elementPosition)
}
const makeDomShiftable = dom => {
  const targetIsShiftable = isShiftable(dom)
  if (!targetIsShiftable)
    dom.style.setProperty('position', 'relative')
}

const shaker = {
  shiftTarget: (x, y) => {
    const target = shakeConfig.targetDom
    if (typeof x === 'undefined') x = 0
    if (typeof y === 'undefined') y = 0
    target.style.setProperty('left', x)
    target.style.setProperty('top', y)
  },
  applyIntensityRatio: vu => {
    const threshold = shakeConfig.shakeThreshold
    let ratio = 0
    for (let i = 0; i < threshold.length; i++) {
      ratio += vu > threshold[i]
    }
    return ratio
  },
  // feed the Intensity got from `applyIntensityRatio` as `this`
  // in a map function
  calculateMoveAmount: function (randomNumber) {
    const offset = this / 2
    const scale = shakeConfig.shakeScale
    return `${scale * ( this * randomNumber - offset )}px`
  },
  shakeCallback: vu => {
    let shakeIntensity = shaker.applyIntensityRatio(vu)
    if (shakeIntensity===0) shaker.shiftTarget()
    else {
      const shiftAmount = getTwoRandomNumbers().map(
        shaker.calculateMoveAmount, shakeIntensity
      )
      shaker.shiftTarget(...shiftAmount)
    }
  },
  applyShaking: targetDom => {
    if (!targetDom) return

    shakeConfig.targetDom = targetDom
    makeDomShiftable(shakeConfig.targetDom)

    // copied and modified the code
    // Travis Holliday's 'VU Meter from Mic Input':
    // https://codepen.io/travisholliday/pen/gyaJk
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    
    if (navigator.getUserMedia) {
      navigator.getUserMedia({
          audio: true
        }, stream => {
          audioContext = new AudioContext()
          analyser = audioContext.createAnalyser()
          microphone = audioContext.createMediaStreamSource(stream)
          javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)
    
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
    
            let average = values / length
            
            shaker.shakeCallback(Math.round(average))
          } // end fn stream
        }, err => {
          document.write(`The following error occured: ${err.name}`)
        })
    } else {
      document.write(`getUserMedia not supported`)
    }
  }
}
