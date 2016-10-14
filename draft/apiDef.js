const F = require('fractal-js')

// TODO: put this in F.data.jsonHeaders and document it!!
let jsonHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

module.exports = (server) => ({
  auth: {
    login: ({email, password}, cbs) => F.data.fetch({
      url: server + '/auth/login',
      options: {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({email, password}),
      },
      response: res => res.json(),
      ...cbs,
    }),
  },
  areas: {
    getAreas: (_, cbs) => F.data.fetch({
      url: server + '/auth/getAreas',
      options: {
        method: 'GET',
      },
      response: res => res.json(),
      ...cbs,
    }),
  },
  user: {
    newTask: ({description, areas, format, file}, {token, ...cbs}) => {
      let data = new FormData()
      data.append('description', description)
      data.append('areas', areas)
      data.append('format', format)
      data.append('file', file)
      return F.data.fetch({
        url: server + '/task/new',
        options: {
          method: 'POST',
          body: data,
          headers: {
            Authorization: token,
          },
        },
        response: res => res.json(),
        ...cbs,
      })
    },
    downloadTask: ({task}, {token, ...cbs}) => F.data.fetch({
      url: server + '/task/download',
      options: {
        method: 'POST',
        body: JSON.stringify({task}),
        headers: {
          Authorization: token,
          ...jsonHeaders,
        },
      },
      response: res => res.blob(),
      ...cbs,
    }),
  },
})
