


# Manager - script that controls/monitors workers from home



# Worker - aka script on a workServer

```js


let workerType = 'PREPPER' // 'PREPPER' | ATTACKER
let target = 'n00dles'


onChange((newInfo)=>{

  workerType = newInfo.workerType;
  target = newInfo.target;

})

```

while(true) {


  

}