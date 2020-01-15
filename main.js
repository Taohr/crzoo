var vue = null
const kLSData = 'crzoo_data_key'
var flag = {
  'page': false,
  'data': false,
}

function onload() {
  initVue()
  flag.page = true
  console.log('page loaded', flag)
  goReady()
}

function goReady() {
  for(var k in flag) {
    if (!flag[k]) {
      return
    }
  }
  ready()
}

function ready() {
  console.log('ready!')

}



function initVue() {
  var app = new Vue({
    el: '#main',
    data: {
      griddata: grid,
    },
    computed: {
    },
    methods: {
      savedata: function() {
        var data = JSON.stringify(this.griddata, null, '\t')
        localStorage.setItem(kLSData, data)
      },
      get_color: function(val) {
        return get_color(val)
      }
    }
  })
  vue = app
}
