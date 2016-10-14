const F = require('fractal-js')
const h = F.h
const R  = require('ramda')
const emitData = F.tasks.data.types.emit


// TODO: add messages for steps, should be functions of response

// TODO: document required steps
// TODO: document validate steps (data, savedData) -> Bool | Promise

module.exports = F.def({
  init: ({key}) => ({
    key,
    step: 0,
    savedData: {},
    steps: R.map(R.assoc('state', 'initial'), [ // states: 'initial' | 'pending' | 'passed' | 'failed'
      {
        service: 'service1',
        name: 'getAny1',
        data: {},
        validate: data => !!data.areas,
        save: data => ({ areas: data.areas }),
      },
      {
        service: 'service2',
        name: 'postAny2',
        data: {
          email: 'user',
          password: 'user123',
        },
        validate: data => data.user && data.user.verified == true,
      },
      {
        service: 'service1',
        name: 'postAny3',
        data: savedData => ({
          description: 'Any file',
          areas: savedData.areas[0].id,
          format: 'pdf',
          file: new Blob(['contentfile12#45'], {type: 'text/plain;charset=utf-8;'}),
        }),
        validate: data => !!data.task,
        save: data => ({ task: data.task }),
      },
      {
        service: 'service1',
        name: 'postAny4',
        data: savedData => ({
          task: savedData.task.id,
        }),
        validate: blob => new Promise((res, rej) => {
          let reader = new FileReader()
          reader.addEventListener('loadend', function() {
            res(reader.result === 'contentfile12#45')
          })
          reader.readAsText(blob)
        })
      },
    ]),
  }),
  inputs: {
    runSteps: async function(ctx, Action, steps) {
      ctx.action$(Action.ClearSaveData())
      let savedData = {}
      for (let i = 0, step; step = steps[i]; i++) {
        ctx.action$(Action.StepState(i, 'pending'))
        let res = await new Promise((p, f) => {
          ctx.task$([step.service, emitData(step.name, (typeof(step.data) === 'function') ? step.data(savedData) : step.data, {
            success: async function(data) {
              let valid = !step.validate
              if (!!step.validate) {
                valid = await step.validate(data, savedData)
              }
              p({success: valid, data: (step.save) ? step.save(data) : {}})
            },
            error: () => p({success: false, data: {}}),
          })])
        })
        console.log(res)
        if (!res.success) {
          ctx.action$(Action.StepState(i, 'failed'))
          if (!step.hasOwnProperty('required') || step.required) {
            break
          }
        } else {
          ctx.action$(Action.StepState(i, 'passed'))
          ctx.action$(Action.SaveData(res.data))
          savedData = R.merge(savedData, res.data)
        }
      }
    },
  },
  actions: {
    StepState: [[Number, String], (idx, state, m) => R.evolve({
      step: R.always(idx),
      steps: R.adjust(R.assoc('state', state), idx),
    }, m)],
    SaveData: [[R.T], (data, m) => R.evolve({savedData: R.merge(data)}, m)],
    ClearSaveData: [[], m => R.evolve({savedData: R.always({})}, m)],
  },
  interfaces: {
    view: (ctx, i, m) => h('div', {class: {[styles.base]: true}}, [
      h('div', {class: {[styles.runButton]: true}, on: {click: () => i.runSteps(m.steps)}}, 'Run'),
      h('div', {class: {[styles.stepIndex]: true}}, `${m.step + 1} / ${m.steps.length} - ${m.steps[m.step].name}`),
      h('div', {class: {[styles.steps.base]: true}},
        m.steps.map((step, idx) => h('div', {key: idx, class: {[styles.steps.item]: true}}, [
          h('div', {key: 'name', class: {[styles.steps.name]: true}}, step.name),
          h('div', {key: 'state', class: {
            [styles.steps.state]: true,
            // TODO: meter esta funcion en helpers fractal
            [styles.steps.initial]: step.state === 'initial', [styles.steps.pending]: step.state === 'pending',
            [styles.steps.passed]: step.state === 'passed', [styles.steps.failed]: step.state === 'failed',
          }}, step.state),
        ]))
      ),
    ]),
  },
})

let styles = F.style.rs({
  base: {
    width: '100%',
    height: '100%',
  },
  stepIndex: {
    margin: '10px',
    fontSize: '22px',
    display: 'inline-block',
  },
  runButton: {
    margin: '10px',
    fontSize: '18px',
    display: 'inline-block',
    padding: '8px 15px',
    color: 'white',
    backgroundColor: '#2AD813',
    borderRadius: '2px',
    '&:hover': {
      backgroundColor: '#21C10B',
    },
  },
  steps: {
    base: {
      width: '300px',
      padding: '10px 15px',
    },
    item: {
      width: '100%',
      height: '30px',
      backgroundColor: '#F1F3F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    name: {
      margin: '0px 18px',
    },
    state: {
      margin: '0px 18px',
      fontSize: '18px',
    },
    initial: { color: 'blue' },
    pending: { color: 'orange' },
    passed: { color: 'green' },
    failed: { color: 'red' },
  },
})
