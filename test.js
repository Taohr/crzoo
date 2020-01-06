var grid = []
const Status = {
  ready:    0,//预备，静止状态，也可以是消除完毕后
  toCheck:  1,//待查，标记的是发生变化的格子
  checking: 2,//检查，所有要检查的，看是否同色的格子，标记已经被检查的
  checked:  3,//查完，标记查完但不是要消除的格子
  matched:  4,//匹配，标记可以被消除的格子
  acting:   5,//消除，标记正在消除的格子，涉及延时动效的时候有用
}

const Model = {
  m3:[[1,1,1]],
  m4:[[1,1,1,1]],
  m5:[[1,1,1,1,1]],
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
  [3,1,1,3,1],
  [2,2,3,1,2],
  [2,3,2,1,3],
  [3,2,3,2,2],
]
grid = grid.map((row)=>{
  return row.map((it)=>{
    return {val:it, st:Status.ready}
  })
})

// 获取坐标(x,y)的格子
function g(x,y) {
  var tmp = grid[y][x]
  return tmp
}

// 获取起始坐标(x,y)，宽高(w,h)区域的格子
function g(x,y,w,h) {
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

var sub = g(1,1,3,3)

console.log(rotate(Model.mL,0))
console.log(rotate(Model.mL,1))
console.log(rotate(Model.mL,2))
console.log(rotate(Model.mL,3))
