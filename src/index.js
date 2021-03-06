const { app, BrowserWindow, Menu, autoUpdater, dialog, globalShortcut } = require('electron');
const shell = require('electron').shell
const fetch = require('node-fetch');
const client = require('discord-rich-presence')('705853390214791258'); 
const server = 'https://hazel-gilt.now.sh'
const feed = `${server}/update/${process.platform}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 60000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

 app.on('ready', function(){
   createWindow()
   const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
   Menu.setApplicationMenu(mainMenu);
 })
 
 const mainMenuTemplate = [
   {
     label: 'RiseFM',
     submenu: [
       {label:'Discord',
        click() {
          shell.openExternal('https://discord.gg/sSt9PHd')
        }}
     ]
   }
 ];
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const updateSong = async () => {
  try {
    let data = await (await fetch(`https://radio.risefm.net/api/nowplaying/1`)).json();
    let { now_playing: np } = data;
    let { song } = np;
    let { artist, title} = song;
    client.updatePresence({
      details: `Listening to RiseFM`,
      state: `${title} by ${artist}`,
      largeImageKey: 'icon',
      largeImageText: 'risefm.net',
      instance: true,
    });
  } catch (err) {
    console.error(err);
  };
};

updateSong();
setInterval(updateSong, 5000);


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.