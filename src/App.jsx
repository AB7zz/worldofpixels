import React from 'react'
import './app.css'
import { motion } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get, child } from "firebase/database";
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

  const [color, setColor] = React.useState('red')
  const [rectangles, setRectangles] = React.useState([])
  const [newRect, setNewRect] = React.useState({})

  React.useEffect(() => {
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
  }, [rectangles])

  React.useEffect(() => {
    const database = getDatabase();
    const dbRef = ref(database, 'pixels');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setRectangles(data)
      console.log('fetched from firebase')
    });

    const canvas = document.getElementById('pixelCanvas');

    const canvasWidth = 2500;
    const canvasHeight = 2500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

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
        } else {
          console.log("No data available");
          for (let x = 0; x < canvasWidth; x += rectWidth + spacing) {
            for (let y = 0; y < canvasHeight; y += rectHeight + spacing) {
              rectangles.push({ x, y, width: rectWidth, height: rectHeight, color: '#fafafa' })
            }
          }
          setRectangles(rectangles)
        }
      }).catch((error) => {
        console.error(error);
      });
      
      
      // console.log(rectangles)
    }

    createRectanglePattern()

    
      
  }, [])

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
    setColor(newcolor)
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
        </div>
      </div>
    </div>
      <div id="canvasContainer">
        <canvas className='' id="pixelCanvas"></canvas>
      </div>
    </>
  )
}

export default App
