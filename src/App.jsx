import React from 'react'
import './app.css'
import { motion } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyAy-L83yGD00fmK321cTsS0GmMiRWpgC0E",
  authDomain: "worldofpixels-e0c39.firebaseapp.com",
  projectId: "worldofpixels-e0c39",
  storageBucket: "worldofpixels-e0c39.appspot.com",
  messagingSenderId: "472744668791",
  appId: "1:472744668791:web:0a08b1686e7fd3fd38e072",
  measurementId: "G-BCF4ZZ7YHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();

function App() {

  const [color, setColor] = React.useState('red')
  const [rectangles, setRectangles] = React.useState([])
  const [newRect, setNewRect] = React.useState({ x: 0, y: 0, width: 0, height: 0 })

  React.useEffect(() => {
    const starCountRef = ref(database, 'pixels');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      setRectangles(data)
      console.log('fetched from firebase')
    });
  }, [])

  React.useEffect(() => {
    console.log('updating the canvas')
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles.forEach(rect => {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    })
  }, [rectangles])

  React.useEffect(() => {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');

    // Define canvas properties
    const canvasWidth = 2500;
    const canvasHeight = 2500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
    let isDragging = false;
    let SCROLL_SENSITIVITY = 0.0005
    let cameraZoom = 1
    let MAX_ZOOM = 5
    let MIN_ZOOM = 0.1    

    const pixelSize = 10;

    const rectWidth = 10;
    const rectHeight = 10;
    const spacing = 1;

    function draw(){
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
      
      ctx.scale(cameraZoom, cameraZoom)
      
      createRectanglePattern()

      requestAnimationFrame(draw)
    }

    function drawRectangle(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, rectWidth, rectHeight);
    }

    let rectangles = []

    function createRectanglePattern() {
      const starCountRef = ref(database, 'pixels');
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if(data){
          data.forEach(rect => {
            drawRectangle(rect.x, rect.y, rect.color)
          })
          setRectangles(data)
        }else{
          for (let x = 0; x < canvasWidth; x += rectWidth + spacing) {
            for (let y = 0; y < canvasHeight; y += rectHeight + spacing) {
              drawRectangle(x, y, '#fafafa')
              rectangles.push({ x, y, width: rectWidth, height: rectHeight, color: '#fafafa' })
            }
          }
          setRectangles(rectangles)
        }
      });
      
      
      // console.log(rectangles)
    }

    createRectanglePattern()

    function isMouseInsideRect(x, y, rect) {
      return x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height;
    }

    

    let dragStart = { x: 0, y: 0 }

    function onPointerDown(e)
    {
        isDragging = true
        dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
        dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
    }

    function onPointerUp(e)
    {
        isDragging = false
        initialPinchDistance = null
        lastZoom = cameraZoom
    }

    function onPointerMove(e)
    {
        if (isDragging)
        {
            cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
            cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
        }
    }

    function handleTouch(e, singleTouchHandler)
    {
        if ( e.touches.length == 1 )
        {
            singleTouchHandler(e)
        }
        else if (e.type == "touchmove" && e.touches.length == 2)
        {
            isDragging = false
            handlePinch(e)
        }
    }

    let initialPinchDistance = null
    let lastZoom = cameraZoom

    function handlePinch(e)
    {
        e.preventDefault()
        
        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
        
        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
        
        if (initialPinchDistance == null)
        {
            initialPinchDistance = currentDistance
        }
        else
        {
            adjustZoom( null, currentDistance/initialPinchDistance )
        }
    }

    function adjustZoom(zoomAmount, zoomFactor)
    {
      if (!isDragging)
      {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )

        console.log(cameraZoom)

        ctx.scale(cameraZoom, cameraZoom)

      }
    }

    canvas.addEventListener('click', function(event) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
      rectangles.forEach(rect => {
        if (isMouseInsideRect(mouseX, mouseY, rect)) {
          const newRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }
          setRectangles(rectangles)
          setNewRect(newRect)
        }
      })
    })
    // canvas.addEventListener('mousedown', onPointerDown)
    // canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    // canvas.addEventListener('mouseup', onPointerUp)
    // canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
    // canvas.addEventListener('mousemove', onPointerMove)
    // canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    // canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

    // draw()
      
  }, [])

  React.useEffect(() => {
    const canvas = document.getElementById('pixelCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(newRect.x, newRect.y, newRect.width, newRect.height);

    rectangles.forEach(rect => {
      if(rect.x === newRect.x && rect.y === newRect.y) {
        rect.color = color
      }
    })

    set(ref(database, 'pixels'), rectangles);
    setRectangles(rectangles)
    // console.log(rectangles)
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
