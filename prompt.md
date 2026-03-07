setup一个next.js项目：

每个prompt携带的字段为
- title
- content

使用PROMPT_WALL_PASSWORD envvar作为密码；不需要任何哈希
整个数据库的所有东西全部存储在一个json里面，这个json以prompt-wall为key，内容是一个列表，列表的每一项是一个prompt。放在redis里面。redis里面还有其他app的数据，不要乱动。

以粉色为主色调，每个卡片的颜色应该是在粉紫到玫红之间的光谱。
添加一个copy按钮，复制时以这种格式（不含code block)：

```
# <title>

<content>
```


Iterate and implement until the required feature runs correctly, DO NOT stop after an initial implementation.
在当前目录下初始化仓库，不要创建一个子目录