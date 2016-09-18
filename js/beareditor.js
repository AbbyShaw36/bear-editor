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
      "insertUnorderedList", "insertOrderedList", "justifyCenter",
      "justifyLeft", "justifyRight", "createLink"
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
      "insertOrderedList": "icon-list-numbered",
      "justifyCenter": "icon-paragraph-center",
      "justifyLeft": "icon-paragraph-left",
      "justifyRight": "icon-paragraph-right",
      "createLink": "icon-link"
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

    // 用于判断是否可执行操作
    this.disabled = false;

    this._init();
  };

  BearEditor.prototype = {
    constructor: BearEditor,

    // 初始化
    _init: function() {
      this.showCode = false;
      this._createEditor();
    },


    /*
     * 编辑器
     * */

    // 创建文本编辑器
    _createEditor: function() {
      var html = '<div class="beareditor">' +
        '<div class="beareditor-toolbar"><ul></ul></div>' +
        '<div class="beareditor-area">' +
        '<textarea class="beareditor-codearea"></textarea>' +
        '<div class="beareditor-textarea" contenteditable="true"><p></p></div>' +
        '</div>' +
        '<div class="beareditor-submenu"></div>' +
        '</div>';

      this.parentNode.innerHTML = html;

      this._areaFocus();
      this._addToolbar();
    },

    // 绑定文本输入框获取焦点事件
    _areaFocus: function() {
      var self = this;
      var textarea = this.parentNode.querySelector(
        ".beareditor-textarea");

      var listener = function() {
        var submenus = self.parentNode.querySelectorAll(
          ".beareditor-submenu ul");

        if (submenus.length) {
          submenus.forEach(function(elem, index) {
            if (elem.style.display === "inline-block") {
              elem.style.display = "none";
            }
          });
        }

        self.disabled = false;
      };

      var once = function() {
        console.log(textarea.querySelector("p"));
        textarea.querySelector("p").focus();
        once = null;
      }

      textarea.addEventListener("focus", function() {
        if (once) {
          once();
        }

        listener();
      }, false);

      textarea.querySelector("p").addEventListener("focus", function() {
        console.log(123);
      }, false);
    },

    _countHeight: function() {
      var parentHeight = this.parentNode.offsetHeight;
      var toolbarHeight = this.parentNode.querySelector(
        ".beareditor-toolbar").offsetHeight;

      this.parentNode.querySelector(".beareditor-area").style.height =
        parentHeight - toolbarHeight + "px";
    },


    /*
     * 工具栏
     * */

    // 添加工具栏
    _addToolbar: function() {
      var toolbar = this.option.toolbar,
        className = this.option.className,

        // 用于循环
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

      this._countHeight();
      this._menuListener();
    },

    // 工具栏绑定事件
    _menuListener: function() {
      var toolbar = this.parentNode.querySelectorAll(
          ".beareditor ul li"),

        // 用于循环
        length = toolbar.length,
        i = 0;

      for (i; i < length; i++) {
        var item = toolbar[i],
          cvAttr = item.getAttribute("commandvalue"),
          smAttr = item.getAttribute("submenu");

        if (cvAttr) {
          switch (cvAttr) {
            case "code":
              // 切换代码显示项
              this._codeToggle(item);
              break;
            case "createLink":
              this._createLinkForm(item);
              break;
            default:
              // 直接执行命令项
              this._commandListener(item, cvAttr);
          }

          continue;
        }

        if (smAttr) {
          // 显示子菜单项
          this._submenuItemListener(item, smAttr);
        }
      }
    },

    // 切换代码显示
    _codeToggle: function(menu) {
      var _this = this,
        codearea = this.parentNode.querySelector(
          ".beareditor-codearea"),
        textarea = this.parentNode.querySelector(
          ".beareditor-textarea");

      menu.addEventListener("click", function() {
        var text = textarea.innerHTML,
          code = codearea.value;

        if (_this.showCode) {
          textarea.innerHTML = code;
          textarea.style.display = "block";
          codearea.style.display = "none";

          _this.disabled = false;
        } else {
          codearea.value = textarea.innerHTML;
          textarea.style.display = "none";
          codearea.style.display = "block";

          _this.disabled = true;
        }

        _this.showCode = !_this.showCode;
      }, false);
    },

    _createLinkForm: function(menu) {
      var _this = this,
        linkForm = '<div class="beareditor-link-form">' +
        '<div><label>链接文本：</label><input type="text" class="beareditor-link-text"></div>' +
        '<div><label>链接地址：</label><input type="text" class="beareditor-link-href"></div>' +
        '<div><<button type="button" class="beareditor-link-btn-cancel">取消</button><button type="button" class="beareditor-link-btn-define">确定</button></div></div>';

      menu.addEventListener("click", function() {
        var range = window.getSelection().getRangeAt(0);

        _this.parentNode.querySelector(".beareditor-submenu").innerHTML +=
          linkForm;
        _this.parentNode.querySelector(".beareditor-link-text").value =
          range.toString();
        _this._setPosition(_this.parentNode.querySelector(
          ".beareditor-link-form"), menu);

        _this._createLink(range);
      }, false);
    },

    _createLink: function(range) {
      var _this = this;

      this.parentNode.querySelector(".beareditor-link-btn-define").addEventListener(
        "click",
        function() {
          var text = _this.parentNode.querySelector(
              ".beareditor-link-text").value,
            href = _this.parentNode.querySelector(
              ".beareditor-link-href").value,

            newSelection = document.getSelection();

          range.deleteContents();
          range.insertNode(document.createTextNode(text));

          newSelection.removeAllRanges();
          newSelection.addRange(range);

          document.execCommand("createLink", true, href);
        }, false);
    },

    /*
     * 命令执行
     * menuObj: 绑定事件项
     * commandName: 命令
     * defaultUI: 用户界面
     * argument: 命令副值
     * */
    _commandListener: function(menuObj, commandName, defaultUI, argument) {
      var _this = this;

      menuObj.addEventListener("click", function() {
        if (_this.disabled) {
          return;
        }

        document.execCommand(commandName, defaultUI, argument);
      }, false);
    },

    // 为有子菜单的工具栏项绑定事件
    _submenuItemListener: function(menuObj, menuName) {
      var _this = this;

      menuObj.addEventListener("click", function() {
        if (_this.disabled) {
          return;
        }

        _this._addSubmenu(this, menuName);
      }, false);
    },


    /*
     * 子菜单
     * */

    // 添加子菜单
    _addSubmenu: function(menuObj, menuName) {
      var ul = this.parentNode.querySelector(".beareditor-submenu-" +
          menuName) || document.createElement("ul"),

        allList = this.parentNode.querySelectorAll(
          ".beareditor-submenu ul");

      if (allList.length) {
        allList.forEach(function(elem) {
          if (elem === ul) {
            return;
          }

          elem.style.display = "none";
        });
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

        html = '<li commandvalue="' + (menuName === "fontSize" ? i :
            value) +
          '"><a href="javascript: void(0);" style="' + styleName +
          ':' +
          value + '">' + value + '</a></li>';

        arr.push(html);
      }

      html = arr.join("");

      ul.className += "beareditor-submenu-" + menuName;
      ul.setAttribute("commandName", menuName);
      ul.style.display = "inline-block";
      ul.innerHTML = html;

      this.parentNode.querySelector(".beareditor-submenu").appendChild(
        ul);
      this._setPosition(ul, menuObj);
      this._submenuListener(ul);
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
    },

    /*
     * 绑定子菜单事件
     * submenu: 绑定的子菜单项
     * */
    _submenuListener: function(submenu) {
      var list = submenu.querySelectorAll("li");

      list.forEach(function(elem, index) {
        elem.addEventListener("click", function() {
          var commandName = submenu.getAttribute("commandName");
          var commandValue = this.getAttribute("commandvalue");

          document.execCommand(commandName, false, commandValue);
        }, false);
      });
    }
  };

  global.BearEditor = BearEditor;
})(window);
