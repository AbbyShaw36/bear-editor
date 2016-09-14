(function(global) {
  "use strict";

  /*
   * option: 配置项
   * toolbar: 工具栏的菜单项
   * className: 工具栏菜单项所对应的icon
   * submenu: 工具栏菜单项的子菜单
   * */
  var option = {
    toolbar: ["code", "Bold", "Italic", "Underline", "StrikeThrough",
      "fontName", "fontSize", "SuperScript", "SubScript",
      "insertUnorderedList", "insertOrderedList"
    ],
    className: {
      "code": "icon-embed2",
      "Bold": "icon-bold",
      "Italic": "icon-italic",
      "Underline": "icon-underline",
      "StrikeThrough": "icon-strikethrough",
      "fontName": "icon-font",
      "fontSize": "icon-font-size",
      "SuperScript": "icon-superscript2",
      "SubScript": "icon-subscript2",
      "insertUnorderedList": "icon-list2",
      "insertOrderedList": "icon-list-numbered"
    },
    submenu: {
      "fontName": {
        styleName: "font-family",
        styleValues: ["宋体", "黑体", "楷体", "微软雅黑", "Arial", "Verdana",
          "Georgia", "Time New Roman", "Microsoft JhengHei",
          "Trebuchet MS", "Courier New", "Impact", "Comic Sans MS",
          "Consolas"
        ]
      },
      "fontSize": {
        styleName: "font-size",
        styleValues: ["12px", "13px", "16px", "18px", "24px", "32px",
          "48px"
        ]
      }
    }
  };

  var BearEditor = window.BearEditor || function(parentNode) {
    this.parentNode = parentNode;
    this.option = option;
    this._init();
  };

  BearEditor.prototype = {
    constructor: BearEditor,
    // 初始化
    _init: function() {
      this.showCode = false;
      this._createEditor();
    },
    // 创建文本编辑器
    _createEditor: function() {
      var html = '<div class="beareditor">' +
        '<div class="beareditor-toolbar"><ul></ul></div>' +
        '<div class="beareditor-area">' +
        '<textarea class="beareditor-codearea"></textarea>' +
        '<div class="beareditor-textarea" contenteditable="true"></div>' +
        '</div>' +
        '<div class="beareditor-submenu"></div>' +
        '</div>';

      this.parentNode.innerHTML = html;
      this._addToolbar();
    },
    // 添加工具栏
    _addToolbar: function() {
      var toolbar = this.option.toolbar,
        className = this.option.className,
        arr = [],
        html = "",
        length = toolbar.length,
        i = 0;

      for (i; i < length; i++) {
        var item = toolbar[i];

        html = '<li ' +
          (this.option.submenu[item] ?
            'submenu="' + item + '"' :
            'commandvalue="' + item + '"') +
          '><a href="javascript:void(0);" class="' + className[item] +
          '"></a></li>';

        arr.push(html);
      }

      html = arr.join("");

      this.parentNode.querySelector(".beareditor-toolbar ul").innerHTML =
        html;
      this._menuListener();
    },
    // 工具栏绑定事件
    _menuListener: function() {
      var toolbar = this.parentNode.querySelectorAll(
          ".beareditor ul li"),
        length = toolbar.length,
        i = 0;

      for (i; i < length; i++) {
        var item = toolbar[i];
        var cvAttr = item.getAttribute("commandvalue");
        var smAttr = item.getAttribute("submenu");

        if (cvAttr) {
          if (cvAttr === "code") {
            // 切换代码显示项
            this._codeToggle(item);
          } else {
            // 直接执行命令项
            this._commandListener(item, cvAttr);
          }
        }

        if (smAttr) {
          // 显示子菜单项
          this._submenuItemListener(item, smAttr);
        }
      }
    },
    // 切换代码显示
    _codeToggle: function(menu) {
      var self = this;
      var codearea = this.parentNode.querySelector(
        ".beareditor-codearea");
      var textarea = this.parentNode.querySelector(
        ".beareditor-textarea");

      menu.addEventListener("click", function() {
        var text = textarea.innerHTML;
        var code = codearea.value;

        if (self.showCode) {
          textarea.innerHTML = code;
          textarea.style.display = "block";
          codearea.style.display = "none";
        } else {
          codearea.value = textarea.innerHTML;
          textarea.style.display = "none";
          codearea.style.display = "block";
        }

        self.showCode = !self.showCode;
      }, false);
    },
    /*
     * 命令执行
     * menu: 绑定事件项
     * commandName: 命令
     * defaultUI: 用户界面
     * argument: 命令副值
     * */
    _commandListener: function(menuObj, commandName, defaultUI, argument) {
      menuObj.addEventListener("click", function() {
        document.execCommand(commandName, defaultUI, argument);
      }, false);
    },
    // 为有子菜单的工具栏项绑定事件
    _submenuItemListener: function(menuObj, menuName) {
      var self = this;

      menuObj.addEventListener("click", function() {
        self._addSubmenu(this, menuName);
      }, false);
    },
    // 添加子菜单
    _addSubmenu: function(menuObj, menuName) {
      var ul = this.parentNode.querySelector(".beareditor-submenu-" +
        menuName) || document.createElement("ul");
      var allList = this.parentNode.querySelectorAll(
        ".beareditor-submenu ul");

      if (allList.length) {
        allList.forEach(function(elem) {
          if (elem === ul) {
            return;
          }

          elem.style.display = "none";
        })
      }

      if (ul.style.display !== "") {
        if (ul.style.display === "none") {
          ul.style.display = "inline-block";
        } else {
          ul.style.display = "none";
        }

        return;
      }

      var submenu = this.option.submenu[menuName],
        styleValues = submenu.styleValues,
        styleName = submenu.styleName,
        arr = [],
        html = "",
        length = styleValues.length,
        i = 0;

      for (i; i < length; i++) {
        var value = styleValues[i];

        html = '<li commandvalue="' + value +
          '"><a href="javascript: void(0);" style="' + styleName +
          ':\'' +
          value + '\'">' + value + '</a></li>';
        arr.push(html);
      }

      html = arr.join("");

      ul.className = "beareditor-submenu-" + menuName;
      ul.style.display = "inline-block";
      ul.innerHTML = html;

      this.parentNode.querySelector(".beareditor-submenu").appendChild(
        ul);
      this._setPosition(ul, menuObj);
    },
    /*
     * 设置位置
     * self: 要设置的对象
     * standard: 参照的对象
     * */
    _setPosition: function(self, standard) {
      var minLeft = this.parentNode.offsetLeft;
      var maxLeft = this.parentNode.offsetRight;
      var left = standard.offsetLeft + standard.offsetWidth / 2 - self.offsetWidth /
        2;
      var top = standard.offsetTop + standard.offsetHeight;

      if (left < minLeft) {
        left = minLeft;
      }

      if (left > maxLeft) {
        left = maxLeft;
      }

      self.style.left = left + "px";
      self.style.top = top + "px";
    }
  };

  global.BearEditor = BearEditor;
})(window);
