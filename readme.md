![Logo](https://raw.githubusercontent.com/Armagann/UPLOAD/master/FreshDB.png)

# 🌿 **Fresh.db**

- Easy to use and fast JSON file based database.

## ⏬ **Installation**

```diff
$ npm install fresh.db
```

## 🌐 API

### FreshDBOptions

- **`name<String>`:** Database name. `db`
- **`folderPath<String>`:** Database folder path. `./fresh.db`
- **`prettySave<Boolean>`:** If its true brefore saving prettfys the data. `false`
- **`prettySaveSS<Integer>`:** Prettyf spacing amount. `2`
- **`disableGetSetErrors<Boolean>`:** If the setting is true, it does not care about the errors that occur while putting or receiving data in the database and tries again. `false`
- **`DEBUG<Boolean>`:** `false`

---

### FreshDB

> Functions's first is argument always dataPath and it is string if first argument is exits

- `set()`: (Any)
  - **arg-1:** (String)
  - **arg-2:** (Any)
- `get()`: (Any)
  - **arg-1:** (String)
- `del()`: (Boolean)
  - **arg-1:** (String)
- `has()`: (Boolean)
  - **arg-1:** (String)
- `update()`
  - **arg-1:** (String)
  - **arg-2:** (Function(data))
  - **Example:**
  ```js
  set("my.data", 6); // 6
  getAll(); // {"my":{"data":6}}
  update("my.data", (d) => {
    return d * 2;
  }); // 12
  getAll(); // {"my":{"data":12}}
  ```
- `getAll()`: (Object)
- `s.push()`: (Array)
  - **arg-1:** (String)
  - **arg-2:** (Any)
- `s.shift()`: (Any)
  - **arg-1:** (String)
- `s.add()`: (Number)
  - **arg-1:** (String)
  - **arg-2:** (Number)
- `s.subtract()`: (Number)
  - **arg-1:** (String)
  - **arg-2:** (Number)
- `s.mulitply()`: (Number)
  - **arg-1:** (String)
  - **arg-2:** (Number)
- `s.divide()`: (Number)
  - **arg-1:** (String)
  - **arg-2:** (Number)
- `clear()`: (None)
- `deleteDatabase()`: (None)
- `isDeleted`: (Boolean)

---

### Example

```js
const FreshDB = require("fresh.db");
// create a db or get existing one
let db = new FreshDB();

db.set("gameSettings.difficulty", "Hard");

db.set("gameSettings.playerName", "Armağan");

// Add random items to player's inventory
db.s.push(
  "player.inventory",
  "Gold Sword",
  "Diamond Hoe",
  "Hacked Sword",
  "Apple",
  "Beef",
  "Hacked Beef"
);

// But i don't want hacked items
db.update("player.inventory", (d) => {
  return d.filter((i) => !i.toLowerCase().includes("hacked"));
});

// get 2nd item in player's inventory
db.get("player.inventory[1]"); // Diamond Hoe

// set 2nd item in player's inventory
db.set("player.inventory[1]", "Diamond Sword");
```

## 🔙 Updates

###### Update (1.0.41): Fixed `setDefaultOptions`.

###### **Major Update (1.0.4):** Better error handling & better readme & DEBUG option & prettySave and prettySaveSS options & now you can change default options (`FreshDB.setDefaultOptions({})`) & new 2 shorthands (`db.s`).

###### **Update (1.0.30):** Better handling for shorthands (`db.s`).

###### **Update (1.0.29):** Now supports recursive `folderPath` opening.

###### **Update (1.0.2):** Better readme.

###### **Update (1.0.1):** Fixing lots of bugs.

###### **Update (1.0.0):** First relese.

> ---
>
> Created with ❤ by **Kıraç Armğan Önal** > <sup><sub>+ You are soo cool! Because you are using **FreshDB**! 💕💞💓</sub><sup>
>
> ---
