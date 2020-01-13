var grid = []
const Status = {
  empty:    0,//空白，等待填充新的方块
  filling:  1,//填充，初始化或消除后会填充
  ready:    2,//预备，静止状态，也可以是消除完毕后
  toCheck:  3,//待查，标记的是发生变化的格子
  checking: 4,//检查，所有要检查的，看是否同色的格子，标记已经被检查的
  checked:  5,//查完，标记查完但不是要消除的格子
  matched:  6,//匹配，标记可以被消除的格子
  removing: 7,//消除，标记正在消除的格子，涉及延时动效的时候有用
}

const Model = {
  m3:[[1,1,1]],
  m4:[[1,1,1,1]],
  m5:[[1,1,1,1,1]],
  m22:[
    [1,1],
    [1,1]
  ],
  m221:[
    [1,1,0],
    [1,1,1]
  ],
  m222:[
    [1,1,1],
    [1,1,0]
  ],
  mL:[
    [1,0,0],
    [1,0,0],
    [1,1,1]
  ],
  mT:[
    [1,1,1],
    [0,1,0],
    [0,1,0]
  ],
  mXL1:[
    [1,1,1,1],
    [0,0,1,0],
    [0,0,1,0]
  ],
  mXL2:[
    [1,1,1,1],
    [0,1,0,0],
    [0,1,0,0]
  ],
  mXT:[
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0]
  ]
}

function createGrid(w, h) {
  var tmp = []
  for (var r=0; r<h; r++) {
    var row = []
    tmp.push(row)
    for (var c=0; c<w; c++) {
      row.push(0)
    }
  }
  return tmp
}

grid = [
  [2,3,2,2,3],
  [3,1,1,2,2],
  [2,1,1,2,2],
  [2,3,1,1,3],
  [3,2,3,2,2],
]
grid = grid.map((row,y)=>{
  return row.map((it,x)=>{
    return {val:it, st:Status.ready, pos:{x:x,y:y}}
  })
})
// 行列格式输出矩阵
function tlog(t) {
  var s = t.map((row)=>{
    return row.map((it)=>{
      return JSON.stringify(it)
    }).join(' ')
  }).join('\n')
  console.log(s)
}
function log() {
  var arr = []
  for (var i in arguments) {
    var it = typeof arguments[i] == 'object' ? JSON.stringify(arguments[i]) : arguments[i]
    arr.push(it)
  }
  console.log(arr.join(' '))
  // console.log()// print a \n
}

// 获取坐标(x,y)的格子
function get(x,y) {
  var tmp = grid[y][x]
  return tmp
}

// 获取起始坐标(x,y)，宽高(w,h)区域的格子
function sub(x,y,w,h) {
  var tmp = []
  var rows = grid.slice(y,y+h)
  for (i in rows) {
    var cols = rows[i].slice(x,x+w)
    tmp.push(cols)
  }
  return tmp
}

// 旋转矩阵，dir=1,2,3，顺时针转动次数
function rotate(grd,dir=1) {
  var h = grd.length
  var w = grd[0].length
  var tmp = []
  if (dir == 1) {
    for (var r=0; r<w; r++) {
      var row = []
      for (var or=h-1; or>=0; or--) {
        row.push(grd[or][r])
      }
      tmp.push(row)
    }
  } else if (dir == 2) {
    for (var r=h-1; r>=0; r--) {
      var row = []
      for (var c=w-1; c>=0; c--) {
        row.push(grd[r][c])
      }
      tmp.push(row)
    }
  } else if (dir == 3) {
    for (var r=w-1; r>=0; r--) {
      var row = []
      for (var or=0; or<h; or++) {
        row.push(grd[or][r])
      }
      tmp.push(row)
    }
  } else {
    return grd
  }
  return tmp
}

// 二元化矩阵，元素等于val的为1，其他为0
function bin(grd, val) {
  return grd.map((r)=>{
    return r.map((i)=>{
      i.val = (i.val == val) ? 1 : 0
      return i
    })
  })
}

// 以b为模板比较，对照b为1的位置，
// 若a也为1则返回对应的索引值
function compare(a, b) {
  if (a.length != b.length || a[0].length != b[0].length) {
    return null
  }
  var index = []
  for (var r in b) {
    for (var c in b[r]) {
      if (!b[r][c]) {
        continue
      }
      if (a[r][c].val) {
        index.push(a[r][c].pos)
      } else {
        return null
      }
    }
  }
  return index.length == 0 ? null : index
}

// 某个模板要产生全部的变种
// 应当通过怎样的旋转
function rots(m) {
  if (m == Model.m22) {
    return []
  }
  return m.length > 1 ? [0,1,2,3] : [0,1]
}

// 某个模板的尺寸
// 对应该模板的优先级
// 越大越高
function msize(m) {
  return m.length * m[0].length
}

function offsets(grd, mdl) {
  var v = grd.length - mdl.length +1
  var h = grd[0].length - mdl[0].length + 1
  v = Math.max(v, 0)
  h = Math.max(h, 0)
  return {h: h, v: v}
}

var models = []
for (var k in Model) {
  var model = Model[k]
  var rs = rots(model)
  for (var r in rs) {
    m = rotate(model, rs[r])
    models.push(m)
  }
}
models.sort((a,b)=>{return msize(b)-msize(a)})

for (var i in models) {
  var model = models[i]
  var offset = offsets(grid, model)
  if (offset.h == 0 || offset.v == 0) {
    // too big
    continue
  }
  var h = model.length
  var w = model[0].length
  for (var y=0; y<offset.v; y++) {
    for (var x=0; x<offset.h; x++) {
      // 逐个匹配看是否满足消除的形状
      var subb = sub(x,y,w,h)
      var binn = bin(subb,1)
      var mch = compare(binn, model)
      if (!mch) {
        continue
      }
      for (var i in mch) {
        var idx = mch[i]
        var item = get(idx.x, idx.y)
        item.st = Status.matched
        log(item)
      }
      log('---')
    }
  }
}

