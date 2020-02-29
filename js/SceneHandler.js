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
   * @param {HTMLDivElement} backgroundDom parent dom containing all other scene elements
   * @param {HTMLElement} eventTarget event target to listen events of this class like list update and alert
   */
  constructor({backgroundDom, eventTarget}) {
    this.backgroundDom = backgroundDom
    this.eventTarget = eventTarget
    this.eventType = {
      UPDATE: 'listUpdate',
      LOG: 'sceneMessage'
    }
    /** @type {string} base64 data of a background image */
    this.background = SceneHandler.blankBackground
    /** @type {SceneList} */
    this.sceneList = []
    this.load()
  }
  
  newSceneEvent (type, detail) {
    this.eventTarget.dispatchEvent(new CustomEvent(type, { detail: detail }))
  }
  
  static get blankBackground () {
    return 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
  }
  
  /** load SceneList from localStorage. */
  load () {
    this.loadBackground()
    const scenesString = window.localStorage.getItem('scenesString')
    if (scenesString === null) {
      this.newSceneEvent(this.eventType.LOG, {
        type: 'log',
        message: 'No scenes are found.'
      })
      return false
    } else {
      this.sceneList = JSON.parse(scenesString)
      this.sortScenesByTime()
      return this.sceneList
    }
  }
  
  /** save SceneList to localStorage. */
  save () {
    this.saveBackground()
    try {
      const scenesString = JSON.stringify(this.sceneList)
      window.localStorage.setItem('scenesString', scenesString)
      this.newSceneEvent(this.eventType.LOG, {
        type: 'log',
        message: 'Scenes are stored.'
      })
    } catch (e) {
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: `Can't store scenes.\n${e}`
      })
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
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: 'Background is invalid.'
      })
      return
    }
    this.background = background === '' ? SceneHandler.blankBackground : background
    this.backgroundDom.style.backgroundImage = this.background
  }
  loadBackground () {
    this.background = window.localStorage.getItem('backgroundImage')
    if (this.background && this.backgroundDom) {
      this.backgroundDom.style.backgroundImage = this.background
    }
  }
  saveBackground () {
    try {
      window.localStorage.setItem('backgroundImage', this.background)
    } catch (e) {
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: `Can't store the background.\n${e}`
      })
    }
  }
  
  /**
   * change a Scene of given name.
   * If the scene doesn't exist, pass the given scene data to `add`.
   * @param {Scene} editedScene
   */
  edit (editedScene) {
    const validation = SceneHandler.validateScene(editedScene)
    if (!validation.result) {
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: `The scene to edit is invalid. Check: ${validation.issue}`
      })
      return
    }
    const sceneIndexToEdit =
      this.sceneList.findIndex(s => s.title === editedScene.title)
    if (sceneIndexToEdit === -1) {
      this.add(editedScene)
    } else {
      this.sceneList[sceneIndexToEdit] = editedScene
      this.newSceneEvent(this.eventType.LOG, {
        type: 'log',
        message: `Scene ${this.sceneList[sceneIndexToEdit].title} is updated.`
      })
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
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: `The scene to add is invalid. Check: ${validation.issue}`
      })
      return
    }
    const newSceneAmount = this.sceneList.unshift(newScene)
    this.newSceneEvent(this.eventType.LOG, {
      type: 'log',
      message: `New scene ${newScene.title} is added. ${newSceneAmount} scenes available.`
    })
    this.sortScenesByTime()
  }
  
  remove (sceneTitleToRemove) {
    const sceneIndexToRemove =
      this.sceneList.findIndex(s => s.title === sceneTitleToRemove)
    if (sceneIndexToRemove === -1) {
      /* at the moment of typing this I can't think of
      a situation this could happen. */
      this.newSceneEvent(this.eventType.LOG, {
        type: 'error',
        message: 'The scene is not found.'
      })
    } else {
      const removedScene = this.sceneList.splice(sceneIndexToRemove, 1)
      this.newSceneEvent(this.eventType.LOG, {
        type: 'log',
        message: `Scene ${removedScene[0].title} is deleted.`
      })
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
    this.newSceneEvent(this.eventType.UPDATE, this.list)
  }
}
