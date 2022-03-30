import React, { useEffect, useState } from 'react';

/*

  React.memo를 사용하여 불필요한 컴포넌트 렌더링을 방지 할 수 있다. (성능 최적화)

  React.memo( component , areEqual ) 
  - component : 불필요한 리렌더링 방지하고 싶은 컴포넌트
  - areEqual : 비교 함수, 깊은 비교를 해줌 (객체, 함수, 배열등 비원시 타입을 비교할 때 주로 사용), return은 'true' or 'false'

*/

const CounterA = React.memo(({ count }) => {
  useEffect(() => {
    console.log(`CounterA update - count : ${count}`);
  });
  return <div>{count}</div>;
});

// 자바스크립트에서 객체, 함수, 배열등 비원시 타입을 비교할 때, 객체의 주소에 의한 얕은 비교를 하기 때문에 리렌더링이 일어난다.
const CounterB = React.memo(({ obj }) => {
  useEffect(() => {
    console.log(`CounterB update - count : ${obj.count}`); // 얕은 비교를 하기 떄문에 버튼을 눌렀을 때 React.memo에서 다르다 판단하여 리렌더링 된다. -> areEqual 비교 함수를 이용하여 리렌더링 방지
  });
  return <div>{obj.count}</div>;
});

// areEqual는 React.memo의 비교 함수, 깊은 비교를 해줌
const areEqual = (prevProps, nextProps) => {
  // return true : 이전 프롭스와 현재 프롭스가 같다 -> 리렌더링 x
  // return false : 이전 프롭스와 현재 프롭스가 다르다 -> 리렌더링 o
  return prevProps.obj.count === nextProps.obj.count;
};

// React.memo 는 컴포넌트를 반환하는 고차 컴포넌트
const MemoizedCounterB = React.memo(CounterB, areEqual); //CounterB는 areEqual 함수의 판단에 따라 리렌더링 여부가 결정되는 메모이제이션 컴포넌트

const OptimizeTest = () => {
  const [count, setCount] = useState(1);
  const [obj, setObj] = useState({ count: 1 });

  return (
    <div style={{ padding: 50 }}>
      <div>
        <h2>Counter A</h2>
        <CounterA count={count} />
        <button onClick={() => setCount(count)}>A button</button>
      </div>
      <div>
        <h2>Counter B</h2>
        <MemoizedCounterB obj={obj} />
        <button onClick={() => setObj({ count: obj.count })}>B button</button>
      </div>
    </div>
  );
};

export default OptimizeTest;
