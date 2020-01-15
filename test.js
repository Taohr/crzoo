var grid = []
var dirs = []// 格子补齐的方向，经典玩法是向下的
var val_max = 3// 格子种类总数
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
  // m22:[
  //   [1,1],
  //   [1,1]
  // ],
  // m221:[
  //   [1,1,0],
  //   [1,1,1]
  // ],
  // m222:[
  //   [1,1,1],
  //   [1,1,0]
  // ],
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

function create_grid(w, h, num) {
  var tmp = []
  for (var r=0; r<h; r++) {
    var row = []
    tmp.push(row)
    for (var c=0; c<w; c++) {
      row.push(random_val(num))
    }
  }
  tmp = tmp.map((row,y)=>{
    return row.map((it,x)=>{
      return box_block(it, x, y)
    })
  })
  return tmp
}

function create_dirs(w, h) {
  var tmp = []
  for (var r=0; r<h; r++) {
    var row = []
    tmp.push(row)
    for (var c=0; c<w; c++) {
      var d = {
        from: {x:0, y:-1},
        to: {x:0, y:1}
      }
      if (r == 0) {//第一行没有from
        d.from = null
      }
      if (r == h-1) {
        d.to = null//最后一行没有to
      }
      row.push(d)
    }
  }
  return tmp
}

grid = create_grid(8, 8, val_max)
dirs = create_dirs(8, 8)
grid = [
[3,1,3,3,2,1,4,2],
[3,1,3,2,4,1,4,1],
[2,3,3,1,4,3,4,4],
[3,3,3,1,2,4,4,2],
[1,4,3,4,1,2,4,4],
[2,2,1,2,4,3,3,3],
[2,1,1,1,1,1,2,3],
[2,1,1,1,1,2,2,2],
]
grid = grid.map((row,y)=>{
  return row.map((it,x)=>{
    return box_block(it, x, y)
  })
})
log_grid(grid, 'val')

function log_grid(grd, key='val') {
  var arr = []
  for (var r in grd) {
    var row = []
    for (var c in grd[r]) {
      var item = grd[r][c]
      row.push(item[key])
    }
    arr.push(row)
  }
  log('---', key, '---')
  tlog(arr)
}

function box_block(val, x, y) {
  return {
    val: val,
    st: Status.ready,
    pos: {x: x, y: y},
    pow: 1
  }
}

// 行列格式输出矩阵
function tlog(t) {
  var s = t.map((row)=>{
    return row.map((it)=>{
      return typeof it == 'object' ? JSON.stringify(it) : it
    }).join(' ')
  }).join('\n')
  console.log(s)
  console.log()
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
function compare(a, b, val) {
  if (a.length != b.length || a[0].length != b[0].length) {
    return null
  }
  var index = []
  for (var r in b) {
    for (var c in b[r]) {
      if (!b[r][c]) {
        continue
      }
      if (a[r][c].val == val && a[r][c].st != Status.matched) {
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
    return [0]
  }
  return m.length > 1 ? [0,1,2,3] : [0,1]
}

// 某个模板的尺寸
// 对应模板的优先级
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

// 排重，统计出现的值，对应出现的方块种类
function distinct(grd) {
  var dic = {}
  for (var r in grd) {
    for (var c in grd[r]) {
      var item = grd[r][c]
      dic[item.val] = 1
    }
  }
  var keys = []
  for (var k in dic) {
    keys.push(+k)
  }
  return keys
}

// 准备所有的模板，包括旋转的变种
function get_all_models() {
  var arr = []
  for (var k in Model) {
    var model = Model[k]
    var rs = rots(model)
    for (var r in rs) {
      m = rotate(model, rs[r])
      arr.push(m)
    }
  }
  // 大模板优先
  arr.sort((a,b)=>{return msize(b)-msize(a)})
  return arr
}

var models = get_all_models()

// 初始化后，全部检测。此时不是玩家操作触发
function checkall(val) {
  var matched = []
  // 用模板匹配所有方块
  for (var i in models) {
    var model = models[i]
    // 计算匹配全部范围，所需的偏移量
    var offset = offsets(grid, model)
    if (offset.h == 0 || offset.v == 0) {
      continue
    }
    var h = model.length
    var w = model[0].length
    for (var y=0; y<offset.v; y++) {
      for (var x=0; x<offset.h; x++) {
        // 逐个匹配看是否满足消除的形状
        var subb = sub(x,y,w,h)
        var mch = compare(subb, model, val)
        if (!mch) {
          continue
        }
        var onematch = []
        for (var i in mch) {
          var idx = mch[i]
          var item = get(idx.x, idx.y)
          onematch.push(item)
          item.st = Status.matched
        }
        if (onematch.length > 0) {
          matched.push(onematch)
        }
      }
    }
  }
  return matched
}

function logmatch(match, val) {
  var w = grid[0].length
  var h = grid.length
  var arr = []
  for (var r=0; r<h; r++) {
    arr.push([])
    for (var c=0; c<w; c++) {
      arr[r].push('·')
    }
  }
  for (var i in match) {
    for (var j in match[i]) {
      var item = match[i][j]
      if (item.val == val) {
        arr[item.pos.y][item.pos.x] = val
      }
    }
  }
  tlog(arr)
}

// 随机方块值
function random_val() {
  var val = parseInt(Math.random()*val_max) + 1
  return val
}

function clean_touch() {
  place1 = null
  place2 = null
}

function get_core(match) {
  if (place1 == null && place2 == null) {
    // 非玩家操作
    return match[0]
  }
  // 玩家操作
  if (match[0].val == match[1].val && match[1].val == place1.val) {
    return place1
  }
  else if (match[0].val == match[1].val && match[1].val == place2.val) {
    return place2
  }
  return null
}

// 清理匹配的方块
function clear_match(matches) {
  for (var ig in matches) {
    var group = matches[ig]
    for (var im in group) {
      var match = group[im]
      clear_one_match(match)
    }
  }
}

function clear_one_match(match) {
  var core = get_core(match)
  // log('core', core, match.length)
  for (var i in match) {
    var item = match[i]
    if (item == core) {
      item.pow = match.length
      item.st = Status.ready
    } else {
      item.val = 0
      item.st = Status.empty
      item.pow = 0
    }
  }
}

var place1 = null
var place2 = null
// 点击方块，准备做识别处理
function touch(item) {
  var items = []
  if (place1 == null) {
    place1 = item
  } else if (place1 == item) {
    place1 = null
  } else {
    pos1 = place1.pos
    pos2 = item.pos
    var h = (pos1.y == pos2.y) && (Math.abs(pos1.x - pos2.x) == 1)
    var v = (pos1.x == pos2.x) && (Math.abs(pos1.y - pos2.y) == 1)
    if (h) {
      place2 = item
      items = [place1, place2]
    } else if (v) {
      place2 = item
      items = [place1, place2]
    } else {
      place1 = null
      place2 = null
    }
  }
  return items
}

// log(touch(get(1,1)))
// log(touch(get(1,2)))

function exchange(a, b) {
  // 交换方块
  grid[a.pos.y][a.pos.x] = b
  grid[b.pos.y][b.pos.x] = a
  // 交换坐标
  var tmpos = a.pos
  a.pos = b.pos
  b.pos = tmpos
}

function empty_block(x,y) {
  return { val: 0, st: Status.empty, pos: {x: x, y: y} }
}

function move(item, pos) {
  var x = item.pos.x
  var y = item.pos.y
  item.pos.x = pos.x
  item.pos.y = pos.y
  grid[pos.y][pos.x] = item
  grid[y][x] = empty_block(x, y)
}

// exchange(get(1,0),get(1,2))
// grid = grid.map((r)=>{
//   return r.map((item)=>{
//     return item.val
//   })
// })
// tlog(grid)

// 获取这里的来去走向
function get_dir(item) {
  var dir = dirs[item.pos.y][item.pos.x]
  return dir
}

// 根据来去走向获取前后item
function get_chain_item(item) {
  var dir = get_dir(item)
  var from = null
  var to = null
  if (dir.from != null) {
    from = grid[item.pos.y+dir.from.y][item.pos.x+dir.from.x]
  }
  if (dir.to != null) {
    to = grid[item.pos.y+dir.to.y][item.pos.x+dir.to.x]
  }
  return {from: from, to: to}
}

function fall_items() {
  var empties = []
  for (var y in grid) {
    for (var x in grid[y]) {
      var item = grid[y][x]
      if (item.st == Status.empty) {
        var chain = get_chain_item(item)
        if (chain.from == null || chain.from.st != Status.empty) {
          empties.push({
            cur: item,
            from: chain.from ? chain.from : null
          })
        }
      }
    }
  }
  if (empties.length == 0) {
    return true
  }
  for (var i in empties) {
    var cur = empties[i].cur
    var from = empties[i].from
    if (from) {
      exchange(cur, from)
    } else {
      var x = cur.pos.x
      var y = cur.pos.y
      var item = box_block(random_val(), x, y)
      grid[y][x] = item
    }
  }
  return false
}

// clear_match(matches)
// log_grid(grid, 'val')
// log_grid(grid, 'st')
// log_grid(grid, 'pow')

// do {
//   var rt = fall_items()
// }while(!rt)

// log_grid(grid, 'pow')

const color = [
  '#F22222',
  '#FFD700',
  '#228B22',
  '#66CDAA',
  '#1929A0',
  '#9350DB',
]

function get_color(val) {
  if (val > color.length) {
    return ''
  }
  return color[val-1]
}

function player_click(item) {
  var touches = touch(item)
  if (touches.length == 2) {
    exchange(touches[0], touches[1])
    place1 = null
    place2 = null
    return true
  }
  return false
}


var matches = []
function button_click(tag) {
  if (tag==1) {
    var allval = distinct(grid)
    log(allval)
    matches = []
    for (var i in allval) {
      var val = allval[i]
      var matched = checkall(val)
      matches.push(matched)
      logmatch(matched, val)
    }
  }
  if (tag == 2) {
    clear_match(matches)
  }
  if (tag == 3) {
    fall_items()
  }
  // do {
  //   var rt = fall_items()
  // }while(!rt)
  log_grid(grid, 'val')
}