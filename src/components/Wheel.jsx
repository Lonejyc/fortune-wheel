import WheelItem from './WheelItem';

import { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import cn from 'mxcn';

import "./Wheel.css";
import arrow from "../assets/Arrow.svg";

function Wheel() {
  const [data, setData] = useState([
    { label: 'Choix 1', value: 1 },
    { label: 'Choix 2', value: 2 },
    { label: 'Choix 3', value: 3 }
  ]);
  
  const [newDatas, setNewDatas] = useState("");

  const handleDelete = (value) => {
    // 1. copie du state
    const datasCopy = [...data];

    // 2. manipulation sur la copie du state
    const datasCopyUpdated = datasCopy.filter((data) => data.value !== value);

    // 3. modifier le state avec le setter
    setData(datasCopyUpdated);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 1. copie du state
    const datasCopy = [...data];

    // 2. manipulation sur la copie du state
    const value = new Date().getTime();
    const label = newDatas;
    const dataToAdd = { label, value };
    datasCopy.push(dataToAdd);

    // 3. modifier le state avec le setter puis vider l'input
    setData(datasCopy);
    setNewDatas("");
  };

  const handleChange = (event) => {
    setNewDatas(event.target.value);
  };

  const [showItems, setShowItems] = useState(true);

  const handleOnClick = () => {
    setShowItems(!showItems);
    console.log("click");
  };

  const spinButtonRef = useRef(null);

  const chartRef = useRef(null);

  const [popup, setPopup] = useState(false);

  const handlePopup = () => {
    setPopup(!popup);
  };

  const [pickedChoice, setPickedChoice] = useState("");

  const displayPickedChoice = () => {
    if (pickedChoice !== "") {
      return pickedChoice;
    }
  };

  useEffect(() => {
    const padding = { top: 10, right: 20, bottom: 10, left: 20 };
    const w = 500 - padding.left - padding.right;
    const h = 500 - padding.top - padding.bottom;
    const r = Math.min(w, h) / 3;
    // const color = d3.scaleOrdinal(d3.schemeCategory10);
    // const color = ['#f54242', '#4287f5', '#f5bf42', '#42f56f', '#f5d742', '#c242f5'];
    const color = ['url(#gradient) #447799', '#fff'];
    const svg = d3.select('svg');

    svg.selectAll('*').remove();

    const container = svg
      .append('g')
      .attr('class', 'chartholder')
      .attr(
        'transform',
        'translate(' + (w / 2 + padding.left) + ',' + (h / 2 + padding.top) + ')'
      );

    const pie = d3.pie().sort(null).value(function (d) {
      return 1;
    });

    const arc = d3.arc().outerRadius(r).innerRadius(0);

    const vis = container.append('g')
      .attr('class', 'pies');

    const arcs = vis
      .selectAll('g.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    arcs
      .append('path')
      .attr('fill', function (d, i) {
        if (color[i % color.length] === undefined) {
          color[i % color.length] -= color.length;
        }
        return color[i % color.length];
      })
      .attr('d', function (d) {
        return arc(d);
      });

    arcs
      .append('text')
      .attr('transform', function (d) {
        d.innerRadius = 0;
        d.outerRadius = r;
        d.angle = (d.startAngle + d.endAngle) / 2;
        return (
          'rotate(' +
          (d.angle * 180 / Math.PI - 90) +
          ')translate(' +
          (d.outerRadius - 10) +
          ')'
        );
      })
      .attr('text-anchor', 'end')
      .text(function (d, i) {
        return data[i].label;
      });

      let rotation = 0;
      let oldrotation = 0;
      let picked = 0;

      function spin(d) {
        // container.on('click', null);
        console.log(data);
      
        const ps = 360 / data.length;
        const rng = Math.floor(Math.random() * (1440 * 4) + 360);
        const offset = 0.25;
      
        rotation = Math.round(rng / ps) * ps;
      
        rotation += 90 - Math.round(ps / 2);

        picked = Math.round(data.length - (rotation % 360) / ps);
        picked = picked >= data.length ? (picked % data.length) : picked;
        picked = (picked + Math.floor(offset * data.length)) % data.length; // to fix the offset
      
        vis
          .transition()
          .duration(5000)
          .attrTween('transform', rotTween)
          .on('end', function () {
            oldrotation = rotation;
            console.log(picked);
            console.log(data[picked].label);
            setPickedChoice(data[picked].label);
            handlePopup();
          });
      }
      
      function rotTween() {
        const i = d3.interpolate(oldrotation % 360, rotation);
        return function (t) {
          return 'rotate(' + i(t) + ')';
        };
      }
      
      // container.on('click', spin);

      if (spinButtonRef.current) {
        spinButtonRef.current.addEventListener('click', spin);
      }
      return () => {
        if (spinButtonRef.current) {
          spinButtonRef.current.removeEventListener('click', spin);
        }
      };
    
  }, [data]);

//affichage (render)

  return (
      <div className="winwheel">
        <h1>Roue de la fortune</h1>
        <div className={cn("picked-item", { 'show': popup })}>
          <button className="button-close" onClick={handlePopup}>X</button>
          <h3>Le résultat est :</h3>
          <h3>{displayPickedChoice()}</h3>
        </div>
        <button className={cn("button-view", { 'reverse': !showItems })} onClick={handleOnClick}><img src={arrow} alt="Flèche" /></button>
        <div id="chart" ref={chartRef}>
          <div className="backgnd"></div>
          <svg className="svg_" width="500" height="500"></svg>
          <button className="spin" ref={spinButtonRef}>SPIN</button>
          <div className="targeter"></div>
        </div>
        <div className={cn("items-view", { 'active': showItems })}>
          <h2>Ajouter des variables</h2>
          <ul>
            {data.map((data) => (
              <WheelItem key={data.value} itemInfo={data} onItemDelete={handleDelete} />
            ))}
          </ul>
          <form action="submit" onSubmit={handleSubmit}>
            <input
              className='input'
              value={newDatas}
              type="text"
              autoComplete="off"
              placeholder="Ajouter un choix"
              onChange={handleChange}
            />
            <button disabled={!newDatas} className='button-add'>
              <span class="shadow"></span>
              <span class="edge"></span>
              <span class="front text">Ajouter</span>
            </button>
          </form>
        </div>
        <svg style={{ position: 'absolute' }} width="0" height="0" aria-hidden="true" focusable="false">
          <linearGradient id="gradient" x2="1" y2="1">
            <stop offset="0%" stopColor="#00ad02" />
            <stop offset="50%" stopColor="#42d701" />
            <stop offset="100%" stopColor="#7cfc00" />
          </linearGradient>
        </svg>
      </div>
    );
};

export default Wheel;