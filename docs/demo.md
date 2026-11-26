[TOC]

# OneLight

## 1 二级标题

### 1.1 三级标题

#### 1.1.1 四级标题

##### 1.1.1.1 五级标题

###### 1.1.1.1.1 六级标题

## 2 引用块

> 关关雎鸠，在河之洲。窈窕淑女，君子好逑。

## 3 GitHub警告框

> [!NOTE]
>**长风破浪会有时，直挂云帆济沧海。**——李白

> [!TIP]
>
> <img align='right' src="https://ziyuan.guwendao.net/authorImg300/dufu.jpg" alt="杜甫" style="zoom: 60%;" />春望
>
> **杜甫**〔唐代〕
>
> 国破山河在，城春草木深。
> 感时花溅泪，恨别鸟惊心。
> **烽火连三月**，家书抵万金。
> 白头搔更短，浑欲不胜簪。

> [!IMPORTANT]
>
> 问君能有几多**愁**？恰似一江春水向东流。——**李煜**《虞美人·春花秋月何时了》

> [!WARNING]
>
> 醉后不知天在水，满船清梦压星河。——**唐温如**《题龙阳县青草湖》

> [!CAUTION]
>
> 洛阳亲友如相问，一片**冰心**在玉壶。——**王昌龄**《芙蓉楼送辛渐》

## 4 代码

行内代码 `caolib/typora-onelight-theme`

```javascript
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    //http proxy
    server: {
        host: 'localhost',
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
})
```

## 5 列表

无序列表：


- 无
  - 无序
    - 无序列
      - 无序列
      - 无序列表

有序列表：

1. 有
2. 有序
3. 有序列
4. 有序列表

任务列表：

- [x] 已完成任务
- [ ] 未完成任务

## 6 文本

| 效果                              | 语法                                | 快捷键                                             |
| --------------------------------- | ----------------------------------- | -------------------------------------------------- |
| ==文本高亮==                      | `==文本高亮==`                      | 选中文本后双击<kbd>=</kbd>键                       |
| **加粗**                          | `**加粗**`                          | 选中文本后<kbd>Ctrl B</kbd>                        |
| *斜体*                            | `*斜体*`                            | 选中文本后<kbd>Ctrl I</kbd>                        |
| ~~删除线~~                        | `~~删除线~~`                        | 选中文本后按住<kbd>Shift</kbd>然后双击<kbd>~</kbd> |
| <u>下划线</u>                     | `<u>下划线</u>`                     | 选中文本后<kbd>Ctrl U</kbd>                        |
| <kbd>Ctrl</kbd>                   | `<kbd>Ctrl</kbd>`                   | 无                                                 |
| <span alt='highlight'>高亮</span> | `<span alt='highlight'>高亮</span>` | 无                                                 |

## 7 表格

| 时间                | 人数 | 地点 |
| :------------------ | :--: | ---: |
| 2024-12-15 12:34:59 | 123  | 上海 |
| 2024-12-15 12:35:03 | 456  | 北京 |
| 2024-12-15 12:35:07 | 789  | 深圳 |

宽表与长文本换行：

| 指标 | 说明 | 数值 | 单位 | 来源 | 备注 |
| :--- | :--- | ---: | :--: | :--- | :--- |
| 日均活跃用户 | 统计周期内的日活跃用户数，已剔除重复访问与异常请求，仅保留有效会话 | 12,345 | 人 | 内部统计平台 | 环比上升 <strong>3.2%</strong> |
| 平均响应耗时 | 从请求发起到首字节返回的耗时中位数，覆盖所有成功请求与超时请求 | 218 | ms | 监控系统 | 目标值 `200ms` 以内 |
| 转化率 | 完成目标行为的用户占访问用户的比例，口径与[运营报表](https://example.com)一致 | 4.7 | % | 数据看板 | 按<kbd>Ctrl R</kbd>刷新后更新 |
| 留存率 | 次日仍活跃的用户占当日新增用户的比例，按自然日计算 | 38.6 | % | 内部统计平台 | 连续四周保持平稳 |
| 数据更新时间 | 本批数据完成清洗与入库的时间，时区为 UTC+8 | 2024-12-15 12:35 | — | 调度平台 | 每日 `12:00` 触发 |

## 8 图片

图片默认居中显示，可以设置img标签的algin属性调整为左对齐或者右对齐 

<img src="https://img.shields.io/github/downloads/caolib/typora-onelight-theme/latest/total">

`<img align='left' src="......"/> <img align='right' src="......"/>`

<img align='left' src="https://s2.loli.net/2024/12/29/8KTQLnUcGzX2vdx.gif" alt="社恐" style="zoom:25%;" /><img align='left' src="https://s2.loli.net/2024/12/29/mTNin3OZPyucQpV.gif" alt="威胁" style="zoom:25%;" /><img align='left' src="https://s2.loli.net/2024/12/29/LRBkhyGwbI3toO7.gif" alt="气鼓鼓" style="zoom:25%;" /><img align='left' src="https://s2.loli.net/2024/12/29/Zbnxh3fTJUK8r7V.gif" alt="憋笑" style="zoom:25%;" />











## 9 数学公式

- 行内公式：这是一个数学公式 $\lim\limits_{x \to \infty} \exp(-x)=0$

- 行间公式：

$$
E_0 = mc^2 \\
\quad\text{—— Albert Einstein}
$$

## 10 链接

可以直接用尖括号包裹链接`<url>`或者使用`[title](url)`

<https://kirakira.dpdns.org/>

[kira](https://kirakira.dpdns.org/)

## 11 音频

<audio controls="controls">
  <source src="https://bin-music.netlify.app/songs/%E5%B0%8F%E3%81%95%E3%81%AA%E6%B5%B7-%E7%B5%90%E6%9D%9F%E3%83%90%E3%83%B3%E3%83%89.mp3" type="audio/mp3" />
</audio>
## 12 mermaid

```mermaid
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
```

```mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
```

```mermaid
xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
```

```mermaid
gantt
    dateFormat HH:mm
    axisFormat %H:%M
    Initial milestone : milestone, m1, 17:49, 2m
    Task A : 10m
    Task B : 5m
    Final milestone : milestone, m2, 18:08, 4m
```

