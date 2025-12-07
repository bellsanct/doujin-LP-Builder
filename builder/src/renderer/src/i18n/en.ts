/**
 * English translations
 */
export const en = {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    open: 'Open',
    back: 'Back',
    next: 'Next',
    preview: 'Preview',
    settings: 'Settings',
  },

  // Menu
  menu: {
    file: 'File',
    openTemplate: 'Open Template',
    save: 'Save',
    exportHTML: 'Export HTML',
    quit: 'Quit',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Reset Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    toggleFullscreen: 'Toggle Fullscreen',
    help: 'Help',
    about: 'About',
  },

  // Preview Pane
  preview: {
    toolbar: {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobile: 'Mobile',
    },
    interactive: {
      editLabel: 'Edit',
      clickToEdit: 'Click to edit',
    },
  },

  // Config Editor
  editor: {
    search: {
      placeholder: 'Search settings...',
      noResults: 'No results found',
    },
    sections: {
      basic: 'Basic Settings',
      design: 'Design',
      content: 'Content',
      effects: 'Effects',
    },
    fields: {
      required: 'Required',
      optional: 'Optional',
    },
    array: {
      add: 'Add Item',
      remove: 'Remove',
      moveUp: 'Move Up',
      moveDown: 'Move Down',
    },
    image: {
      upload: 'Upload Image',
      change: 'Change Image',
      remove: 'Remove Image',
    },
  },

  // Template Opener
  templateOpener: {
    title: 'Select Template',
    description: 'Choose a template to get started',
    openFile: 'Open from File',
    openFileDescription: 'Select .zip or .dlpt file',
    recentTemplates: 'Recent Templates',
    browse: 'Browse',
  },

  // Header
  header: {
    openAnother: 'Open Another Template',
    build: 'Build',
  },

  // Messages
  messages: {
    saveSuccess: 'Saved successfully',
    saveFailed: 'Save failed',
    buildSuccess: 'Build complete!\nOutput: {path}',
    buildFailed: 'Build failed',
    confirmSwitchTemplate: 'Open another template? Unsaved changes will be lost.',
    selectTemplate: 'Please select a template and configuration',
  },

  // Build
  build: {
    selectOutput: 'Select Output Directory',
    building: 'Building...',
    complete: 'Build Complete',
  },
} as const;
