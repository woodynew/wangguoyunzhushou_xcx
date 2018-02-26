// pages/group/group.js
const app = getApp()
var api = app.api
var message = app.message

Page({
  /**
  * 页面的初始数据
  */
  data: {
    readyUpdate: false,
    disabled: true,
    dataList: [],
    groupMaster: 0,
    groupLevel: 0,
    groupUserId: 0,
    groupName: '',
    groupId: 0,
  },
  onShareAppMessage: function (res) {
    var that = this

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: that.data.groupName,
      path: '/pages/group/group?type=1&userId=' + that.data.groupUserId
      + '&gname=' + that.data.groupName
      + '&groupId=' + that.data.groupId,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')

    var that = this
    if (that.data.readyUpdate || that.data.dataList.length < 1)
      bindData(that)

    that.setData({ readyUpdate: false })

  },
  onLoad: function (options) {
    var that = this

    bindData(that, function () {
      if (options && options.type && options.type == '1') {
        if (dataList.length > 0)
          return
        wx.showModal({
          title: options.gname,
          content: '请确认是否加入联盟',
          success: function (res) {
            if (res.confirm) {
              api.shareJoinGroup(options.userId, options.groupId, function (result) {
                if (result.errcode == 1) {
                  message.show('已加入')
                  bindData(that)
                }
              })
            } else if (res.cancel) {

            }
          }
        })
      }

      that.setData({ disabled: false })
    })

  },
  onPullDownRefresh: function () {
    var that = this
    bindData(that)
  },
  createTap: function (e) {
    wx.navigateTo({
      url: 'create/create',
    })
  },
  joinTap: function (e) {
    wx.navigateTo({
      url: 'join/join',
    })
  },
  groupInfoTap: function (e) {
    var that = this

    var actionList = []
    if (that.data.groupMaster == that.data.groupUserId) {
      actionList.push('编辑')
      actionList.push('设置')
    }

    if (actionList.length < 1)
      return

    wx.showActionSheet({
      itemList: actionList,
      success: function (res) {
        var actionName = actionList[res.tapIndex]
        if (actionName == '编辑') {
          that.setData({ readyUpdate: true })
          wx.navigateTo({
            url: 'edit/edit',
          })
        } else if (actionName == '设置') {
          wx.navigateTo({
            url: 'setting/setting',
          })
        }
      }
    })
  },
  itemTap: function (e) {
    var that = this
    var item = that.data.dataList[e.currentTarget.dataset.index]
    var curUserId = e.currentTarget.dataset.userid

    var actionList = []

    if (curUserId != that.data.groupUserId)
      actionList.push('遭受集结通知')

    if (curUserId != that.data.groupUserId
      && that.data.groupMaster == that.data.groupUserId && item.level <= 4) {
      actionList.push('阶级更变')
    }

    if (curUserId != that.data.groupUserId
      && that.data.groupMaster == that.data.groupUserId && item.level < 5) {
      actionList.push('请出联盟')
    }

    if (that.data.groupMaster == that.data.groupUserId && item.level == 4)
      actionList.push('让位盟主')

    if (curUserId == that.data.groupUserId)
      actionList.push('退出联盟')

    wx.showActionSheet({
      itemList: actionList,
      success: function (res) {
        var actionName = actionList[res.tapIndex]
        if (actionName == '遭受集结通知') {
          message.loading()
          api.sendJiJieNotice(curUserId, 0, function (result) {
            message.loaded()
            if (result.errcode == 1) {
              if (!result.data) {
                message.modal('通知成功')
                return
              }
              if (result.data && result.data.extCode && result.data.extCode == 1001) {
                wx.showModal({
                  title: '通知失败',
                  content: '盟友余额不足！',
                  confirmText: '使用我的',
                  success: function (res) {
                    if (res.confirm) {
                      message.loading()
                      api.sendJiJieNotice(curUserId, 1, function (result) {
                        message.loaded()
                        if (result.errcode == 1 && !result.data) {
                          message.modal('通知成功')
                        } else {
                          message.modal('通知失败！')
                        }

                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
                return
              }
              if (result.data && result.data.extCode && result.data.extCode == 1002) {
                message.modal('盟友我的余额都不足，通知失败！')
              }
            }
          })
        } else if (actionName == '阶级更变') {
          var actionList2 = []

          if (item.level == 4) {
            actionList2.push('3阶')
            actionList2.push('2阶')
            actionList2.push('1阶')
          }
          if (item.level == 3) {
            actionList2.push('4阶')
            actionList2.push('2阶')
            actionList2.push('1阶')
          }
          if (item.level == 2) {
            actionList2.push('4阶')
            actionList2.push('3阶')
            actionList2.push('1阶')
          }
          if (item.level == 1) {
            actionList2.push('4阶')
            actionList2.push('3阶')
            actionList2.push('2阶')
          }

          wx.showActionSheet({
            itemList: actionList2,
            success: function (res) {
              console.log(res.tapIndex)
              var level = 0
              if (actionList2[res.tapIndex] == '4阶') {
                level = 4
              } else if (actionList2[res.tapIndex] == '3阶') {
                level = 3
              } else if (actionList2[res.tapIndex] == '2阶') {
                level = 2
              } else if (actionList2[res.tapIndex] == '1阶') {
                level = 1
              }
              if (level == 0) {
                return
              }
              api.updateGroupLevel(curUserId, level, function (result) {
                if (result.errcode == 1) {
                  bindData(that)
                  message.show('更改成功')
                }
              })
            },
            fail: function (res) {
              console.log(res.errMsg)
            }
          })
        } else if (actionName == '请出联盟') {
          message.modal2('确认操作？', function (res) {
            if (res.confirm) {
              api.deleteGroupMember(curUserId, function (result) {
                if (result && result.errcode == 1) {
                  bindData(that)
                  message.modal('已将成员请出')
                }
              })
            }
          })
        } else if (actionName == '让位盟主') {
          message.modal2('确认操作？', function (res) {
            if (res.confirm) {
              api.abdicateGroupMaster(curUserId, function (result) {
                if (result && result.errcode == 1) {
                  bindData(that)
                  message.modal('已将盟主让出')
                }
              })
            }
          })

        } else if (actionName == '退出联盟') {
          api.leaveGroup(function (result) {
            if (result && result.errcode == 1) {
              bindData(that)
              message.modal('已退联盟')
            }
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  helpTap: function (e) {
    message.modal('联盟功能不与游戏相关联，可自定义加入其他成员，统一管理，暂时最多容纳200人')
  }

})

function bindData(that, cb) {
  message.loading()

  app.getPersonInfo(function (data) {
    if (data && data.id > 0) {
      api.getUserGroupList(function (result) {
        message.loaded()
        wx.stopPullDownRefresh()
        if (result && result.errcode == 1 && result.data.dataList) {
          that.setData({ dataList: result.data.dataList })
          that.setData({
            groupMaster: result.data.master,
            groupLevel: result.data.level,
            groupUserId: result.data.userId,
            groupName: result.data.groupName,
            groupId: result.data.id
          })
        } else {
          that.setData({ dataList: [] })
          that.setData({
            groupMaster: 0,
            groupLevel: 0,
            groupUserId: 0,
            groupName: '',
            groupId: 0
          })
        }
        initData(that)
        typeof cb == 'function' && cb()
      })
    } else {
      setTimeout(function () {
        bindData(that)
      }, 1000)
      return
    }
  })

}

function initData(that) {
  if (that.data.groupLevel < 4)
    wx.hideShareMenu()
  else {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
}