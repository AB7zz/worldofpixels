import React from 'react'
import './App.css'
import { motion } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get, child } from "firebase/database";
import gsap from 'gsap';

const firebaseConfig = {
  apiKey: "AIzaSyAy-L83yGD00fmK321cTsS0GmMiRWpgC0E",
  authDomain: "worldofpixels-e0c39.firebaseapp.com",
  projectId: "worldofpixels-e0c39",
  storageBucket: "worldofpixels-e0c39.appspot.com",
  messagingSenderId: "472744668791",
  appId: "1:472744668791:web:0a08b1686e7fd3fd38e072",
  measurementId: "G-BCF4ZZ7YHZ"
};

initializeApp(firebaseConfig);

function App() {

  const customInput = React.useRef(null)
  const customDiv = React.useRef(null)
  const [color, setColor] = React.useState('red')
  const [rectangles, setRectangles] = React.useState([])
  const [newRect, setNewRect] = React.useState({})
  const [noYes, setNoYes] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [customColorSet, setCustomColorSet] = React.useState(false)

  React.useEffect(() => {
    console.log(loading)
    if(!loading){
      const canvas = document.getElementById('pixelCanvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if(rectangles){
        console.log('updating the canvas')
        rectangles.forEach(rect => {
          if(rect && rect.color && rect.x && rect.y && rect.width && rect.height){
            ctx.fillStyle = rect.color;
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
          }
        })

        function isMouseInsideRect(x, y, rect) {
          return x >= rect.x && x <= rect.x + rect.width &&
                y >= rect.y && y <= rect.y + rect.height;
        }
    
        canvas.addEventListener('click', function(event) {
          const mouseX = event.offsetX;
          const mouseY = event.offsetY;
          rectangles.forEach(rect => {
            if (isMouseInsideRect(mouseX, mouseY, rect)) {
              console.log(rect.x, rect.y)
              const newRect = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
              }
    
              setNewRect(newRect)
            }
          })
        })
      }
    }
  }, [rectangles, loading])

  React.useEffect(() => {
    console.log(loading)
    const database = getDatabase();
    const dbRef = ref(database, 'pixels');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setRectangles(data)
      console.log('fetched from firebase')
    });

    

    const canvasWidth = 2500;
    const canvasHeight = 2500;
    

    const rectWidth = 10;
    const rectHeight = 10;
    const spacing = 1;

    let rectangles = []

    function createRectanglePattern() {
      const database = getDatabase();
      get(ref(database, 'pixels')).then((snapshot) => {
        if (snapshot.exists()) {
          console.log('Data available')
          const data = snapshot.val();
          setRectangles(data)
          setLoading(false)
        } else {
          console.log("No data available");
          for (let x = 0; x < canvasWidth; x += rectWidth + spacing) {
            for (let y = 0; y < canvasHeight; y += rectHeight + spacing) {
              rectangles.push({ x, y, width: rectWidth, height: rectHeight, color: '#fafafa' })
            }
          }
          setRectangles(rectangles)
          setLoading(false)
        }
      }).catch((error) => {
        console.error(error);
      });
      
      
      // console.log(rectangles)
    }

    createRectanglePattern()
    if(!loading){
      const canvas = document.getElementById('pixelCanvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
    
    
  }, [loading])

  React.useEffect(() => {
    const database = getDatabase();
    if(newRect.x){
      const canvas = document.getElementById('pixelCanvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(newRect.x, newRect.y, newRect.width, newRect.height);
      
      const updatedRectangles = rectangles.map(rect => {
        if(rect.x === newRect.x && rect.y === newRect.y) {
          return { ...rect, color: color }
        }
        return rect
      })

      console.log('updatedRectangles', updatedRectangles)

      set(ref(database, 'pixels'), updatedRectangles);
  
      setRectangles(updatedRectangles)

    }
  }, [newRect])

  const handleColor = (newcolor) => {
    if(newcolor.length <= 7){
      setColor(newcolor)
    }
  }

  const handleCustom = () => {
    gsap.to(customInput.current, { duration: 0.5, width: "100px", textAlign: 'initial', paddingLeft: '10px', borderRadius: '10px', fontSize: '20px', ease: "bounce", marginLeft: '10px' });
    customInput.current.value = ''
    customInput.current.placeholder = '#000000'

    setNoYes(true)
  }

  React.useEffect(() => {
    console.log('new color set')
    if(customColorSet){
      console.log('new color set', color)
      customDiv.current.style.backgroundColor = color
    }
  }, [color, customColorSet])

  const handleCustomColor = () => {
    setNoYes(false)
    setCustomColorSet(true)
    gsap.to(customInput.current, { duration: 0.5, width: "40px", textAlign: 'center', paddingLeft: '0px', borderRadius: '50%', fontSize: '30px', ease: "bounce" });
    customInput.current.value = '+'
    console.log(color)
  }

  const handleCancelCustom = () => {
    gsap.to(customInput.current, { duration: 0.5, width: "40px", textAlign: 'center', paddingLeft: '0px', borderRadius: '50%', fontSize: '30px', ease: "bounce" });
    customInput.current.value = '+'

    setNoYes(false)
  }

  return (
    <>
      <div className='absolute z-20 left-[30%]'>
        <div className='bg-white rounded-[100px] px-5 py-3 w-[500px]'>
          <div className='flex justify-around'>
            <motion.div
              onClick={() => handleColor('red')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-red-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            <motion.div
              onClick={() => handleColor('green')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-green-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            <motion.div
              onClick={() => handleColor('blue')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-blue-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            <motion.div
              onClick={() => handleColor('orange')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-orange-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            <motion.div
              onClick={() => handleColor('yellow')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-yellow-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            <motion.div
              onClick={() => handleColor('purple')}
              whileHover={{ scale: 1.2 }}
              className='hover:cursor-pointer bg-purple-500 rounded-[50%] px-5 py-5'>
            </motion.div>
            {customColorSet && <motion.div
              ref={customDiv}
              onClick={() => handleColor(color)}
              whileHover={{ scale: 1.2 }}
              className={`hover:cursor-pointer rounded-[50%] px-5 py-5`}>
              </motion.div>
            }
            <motion.input
              onClick={() => handleCustom()}
              whileHover={{ scale: 1.2 }}
              defaultValue="+"
              onChange={e => handleColor(e.target.value)}
              ref={customInput}
              className='hover:cursor-pointer rounded-[50%] w-[40px] text-3xl text-center border border-2 px-0 py-0' />
            
            
            {noYes &&
              <div className='ml-2 flex'>
                <motion.button 
                  onClick={handleCancelCustom}
                  whileHover={{ scale: 1.2 }}
                  className='rounded-[50%] px-3 py-1 border border-2 mr-2'>
                    <i className="fa-solid fa-xmark"></i>
                </motion.button>
                <motion.button 
                  onClick={handleCustomColor}
                  whileHover={{ scale: 1.2 }}
                  className='rounded-[50%] px-3 py-1 bg-green-500'>
                    <i className="fa-solid fa-check text-white"></i>
                </motion.button>
              </div>
            }
          </div>
        </div>
      </div>
      {loading ?
      <div class="load-container">
        <div class="loader">
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
          <span class="loader-block"></span>
        </div>
      </div>
      :
      <div id="canvasContainer">
        <canvas className='' id="pixelCanvas"></canvas>
      </div>}
    </>
  )
}

export default App
