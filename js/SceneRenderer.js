/**
 * @typedef Scene
 * @type {object}
 * @property {string} title single line string for game title
 * @property {string} object single line string describing what you want to achieve
 * @property {string} sideImage base64 data of an image
 * @property {string} sideText multi line string for any message
 * @property {number} lastUsed UTC milliseconds of last time the scene is interacted
 */

class SceneRenderer {
  /**
   *
   * @param {HTMLInputElement} title
   * @param {HTMLInputElement} object
   * @param {HTMLImageElement} sideImage
   * @param {HTMLInputElement} sideImageLoader
   * @param {HTMLTextAreaElement} sideText
   */
  constructor({title, object, sideImage, sideImageLoader, sideText}) {
    /** @type {Scene} */
    this.scene = {
      title: '',
      object: '',
      sideImage: '',
      sideText: '',
      lastUsed: 0
    }
    this.dom = {}
    this.dom.title = title || null
    this.dom.object = object || null
    this.dom.sideImage = sideImage || null
    this.dom.sideImageLoader = sideImageLoader || null
    this.dom.sideText = sideText || null
    
    this.fileReader = new FileReader()
    
    this.dom.sideImageLoader.addEventListener('change', this.setSideImage.bind(this))
  }
  
  setSideImage () {
    const file = this.dom.sideImageLoader.files[0]
    this.fileReader.addEventListener('load', () => {
      this.dom.sideImage.src = this.fileReader.result
      this.scene.sideImage = this.fileReader.result
    }, false)
    if (file) { this.fileReader.readAsDataURL(file) }
  }
}