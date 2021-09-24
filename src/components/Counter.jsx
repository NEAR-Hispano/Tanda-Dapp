import React, {useState} from "react";

const Counter = () => {
    // 01. Definicion del estado del contador
    //const [count, setCount] = useState(0);


    // 02. Definicion de dos estados left y right
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);


    //03. Definición de un estado con objeto
    const [counters, setCounters] = useState({
        left: 0,
        right: 0,
        clicks: 0,
    });


    const [clicks, setClicks] = useState([]);
    // Funcion para resetear el valor del contador a cero
    const reset = () => {
        setCount(0);
    }

    const handleClickLeft = () => {
        /*setCounters({
            left: counters.left + 1,
            right: counters.right,
            clicks: counters.clicks + 1
        });*/
        setCounters({
            ...counters,
            left: counters.left + 1,
            clicks: counters.clicks + 1
        });
        setClicks((prev)=>[...prev, 'L']);
    }

    const handleClickRight = () => {
        setCounters({
            left: counters.left,
            right: counters.right + 1,
            clicks: counters.clicks + 1
        })
        setClicks((prev)=>[...prev, 'R']);
    }
    /*return (
        <>
        <h1>Counter</h1>
        <div>
            Left Counter: {left}
            <button onClick={() => setLeft(left + 1)}>+ 1</button>
            <button onClick={() => setLeft(left - 1)}>- 1</button>
            
        </div>
        <p>

        </p>
        <div>
            Right Counter: {right}
            <button onClick={() => setRight(right + 1)}>+ 1</button>
            <button onClick={() => setRight(right - 1)}>- 1</button>
        </div>
        
        </>
    );*/

    return (
        <>
        <h1>Counter</h1>
        <div>
            Left Counter: {counters.left}
            <button onClick={handleClickLeft}>+ 1</button>
            <button onClick={handleClickRight}>+ 1</button>
            Right Counter: {counters.right}
        </div>
        Click counter: {clicks}
        </>
    );
}

export default Counter;