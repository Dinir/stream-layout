/**
 * @typedef Scene
 * @type {object}
 * @property {string} title single line string for game title
 * @property {string} object single line string describing what you want to achieve
 * @property {string} sideImage base64 data of an image
 * @property {string} sideText multi line string for any message
 * @property {number} lastUsed UTC milliseconds of last time the scene is interacted
 */
/**
 * @typedef SceneList
 * @type Scene[]
 * SceneList is sorted by `lastUsed`, which is updated whenever a Scene is displayed or edited.
 */

class SceneHandler {
  /**
   * @param {Class} listHandler an instance that controls a DOM that displays SceneList
   * @param {Class} alertDisplayer an instance that shows messages on the page
   */
  constructor({backgroundDom, listHandler, alertDisplay}) {
    this.backgroundDom = backgroundDom
    this.listHandler = listHandler
    this.alertDisplay = alertDisplay
    this.blankBackground = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    /** @type {string} base64 data of a background image */
    this.background = this.blankBackground
    /** @type {SceneList} */
    this.sceneList = []
    this.load()
  }
  
  /** load SceneList from localStorage. */
  load () {
    this.background = window.localStorage.getItem('backgroundImage')
    if (this.background && this.backgroundDom) {
      this.backgroundDom.style.backgroundImage = this.background
    }
    const scenesString = window.localStorage.getItem('scenesString')
    if (scenesString === null) {
      this.alertDisplay.show('log', 'No scenes are found.')
    } else {
      this.sceneList = JSON.parse(scenesString)
      this.sortScenesByTime()
      this.updateList(this.sceneList)
    }
  }
  
  /** save SceneList to localStorage. */
  save () {
    try {
      window.localStorage.setItem('backgroundImage', this.background)
    } catch (e) {
      this.alertDisplay.show('Can\'t store the background.\n', e)
    }
    try {
      const scenesString = JSON.stringify(this.sceneList)
      window.localStorage.setItem('scenesString', scenesString)
      this.alertDisplay.show('log', 'Scenes are stored.')
    } catch (e) {
      this.alertDisplay.show('Can\'t store scenes.\n', e)
    }
  }
  
  /**
   * store the background and apply it to the dom.
   * @param {string} background base64 data of a background image
   */
  editBackground (background = '') {
    if (
      background !== '' && (
        typeof background !== 'string' ||
        background.slice(0, 5) !== 'data:'
      )
    ) {
      this.alertDisplay.show('error', 'Background is invalid.')
      return
    }
    this.background = background === '' ? this.blankBackground : background
    this.backgroundDom.style.backgroundImage = this.background
  }
  
  /**
   * change a Scene of given name.
   * If the scene doesn't exist, pass the given scene data to `add`.
   * @param {Scene} editedScene
   */
  edit (editedScene) {
    const validation = SceneHandler.validateScene(editedScene)
    if (!validation.result) {
      this.alertDisplay.show('error',
        `The scene to edit is invalid. Check: ${validation.issue}`)
      return
    }
    const sceneIndexToEdit =
      this.sceneList.findIndex(s => s.title === editedScene.title)
    if (sceneIndexToEdit === -1) {
      this.add(editedScene)
    } else {
      this.sceneList[sceneIndexToEdit] = editedScene
      this.alertDisplay.show('log',
        `Scene ${this.sceneList[sceneIndexToEdit].title} is updated.`
      )
      this.sortScenesByTime()
    }
  }
  
  /**
   * add a Scene to SceneList.
   * @param {Scene} newScene
   */
  add (newScene) {
    const validation = SceneHandler.validateScene(newScene)
    if (!validation.result) {
      this.alertDisplay.show('error',
        `The scene to add is invalid. Check: ${validation.issue}`)
      return
    }
    const newSceneAmount = this.sceneList.unshift(newScene)
    this.alertDisplay.show('log',
      `New scene ${newScene.title} is added. ${newSceneAmount} scenes available.`
    )
    this.sortScenesByTime()
  }
  
  remove (sceneTitleToRemove) {
    const sceneIndexToRemove =
      this.sceneList.findIndex(s => s.title === sceneTitleToRemove)
    if (sceneIndexToRemove === -1) {
      /* at the moment of typing this I can't think of
      a situation this could happen. */
      this.alertDisplay.show('error',
        'The scene is not found.')
    } else {
      const removedScene = this.sceneList.splice(sceneIndexToRemove, 1)
      this.alertDisplay.show('log',
        `Scene ${removedScene[0].title} is deleted.`)
    }
  }
  
  static validateScene (scene) {
    let validity = true
    const issue = []
    if (typeof scene.title !== 'string' ||
        scene.title.length === 0) {
      validity = false
      issue.push('title')
    }
    if (typeof scene.object !== 'string') {
      validity = false
      issue.push('object')
    }
    if (typeof scene.sideImage !== 'string' ||
        scene.sideImage.slice(0, 5) !== 'data:') {
      validity = false
      issue.push('sideImage')
    }
    if (typeof scene.sideText !== 'string') {
      validity = false
      issue.push('sideText')
    }
    if (typeof scene.lastUsed !== 'number') {
      validity = false
      issue.push('lastUsed')
    }
    
    return {result: validity, issue: issue}
  }
  
  sortScenesByTime () {
    this.sceneList.sort((a, b) => b.lastUsed - a.lastUsed)
  }
  
  /** send SceneList to listHandler */
  updateList () {
    this.listHandler.populateWith(this.sceneList)
  }
}
