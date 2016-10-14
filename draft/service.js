const F = require('fractal-js')
const ApiConstructor = require('./apiDef')

let serverName = 'http://localhost:1337'


module.exports = F.service({
  store: {
    serverName,
    Api: ApiConstructor(serverName),
    connected: false,  // TODO: por hacer
    nickname: '',
    email: '',
    hashedPassword: '',
    token: '',
    userInfo: {
      type:'',
      di:'',
      raiting:'',
      full_name:'',
    },
    tasksTutor: [],
    tasksClient: [],
  },
  tasks: emit => ({
    _: F.tasks.data.task(emit),
  }),
  drivers: (emit, subscribeAll) => ({
    _: F.drivers.event(subscribeAll),
  }),
  init: function(s, emit, success, err) {
  },
  connect: function(s, emit, socket, success) {
    let polling = () => F.data.fetch({
      ...s.Api.user.polling(s.token),
      success: session => {
        s.conectado = true
      },
      error: () => s.conectado = false,
      netError: () => s.conectado = false,
    })
    polling()
    setInterval(polling, 6000)
  },
  events: s => ({
    login: function(body, {success, error}) {
      s.Api.auth.login(body, {
        success: res => {
          s.token = res.token
          success(res)
        },
        error,
      })
    },
    // register: function(body, success, error) {
    //   F.data.fetch({
    //     ...s.Api.auth.register(body),
    //     success: res => {
    //       success()
    //     },
    //   })
    // },
    getAreas: function(_, cbs) {
      s.Api.areas.getAreas(_, cbs)
    },
    // polling: function(_, success, error) {
    //    F.data.fetch({
    //     ...s.Api.user.polling(s.token),
    //     success: res => {
    //       s.token = res.token
    //       success()
    //     },
    //   })
    // },
    newTask: function(body, cbs) {
      s.Api.user.newTask(body, {token: s.token, ...cbs})
    },
    downloadTask: function(body, cbs) {
      s.Api.user.downloadTask(body, {token: s.token, ...cbs})
    },
    // allTasks: function(_, success, error) {
    //    F.data.fetch({
    //     ...s.Api.user.allTasks(s.token),
    //     success: res => {
    //       s.token = res.token
    //       success()
    //     },
    //   })
  }),
// getOffers
// selectedOffer
// deselectedOffer
})
