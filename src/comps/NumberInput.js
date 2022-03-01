import InputNumber from 'react-input-number';
import {useState} from 'react';

export default function InputNumberComponent(){
    const [num, setNum] = useState(10);

    const changeNumber = (updateValue) => {
        setNum(updateValue);
    }

    return (
    <InputNumber min={10} max={366} step={10} value={num} onChange={setNum} />
    );
}