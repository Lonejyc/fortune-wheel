import WheelItem from './WheelItem';
import { useState, useEffect, useRef } from "react";
import * as d3 from 'd3';
import { scaleOrdinal } from 'd3-scale';
import "./Wheel.css";

function Wheel() {
    // const [items, setItems] = useState([
    //   { label: 'Test', value: 1 }
    // ]);
  
    // const [newItems, setNewItems] = useState("");
    
    const [data, setData] = useState([
      { label: 'Test', value: 1 },
      { label: 'Test', value: 2 },
      { label: 'Test', value: 3 }
    ]);
    
    const [newDatas, setNewDatas] = useState("");
  
    // comportements
    // const handleDelete = (value) => {
    //   // 1. copie du state
    //   const itemsCopy = [...items];
  
    //   // 2. manipulation sur la copie du state
    //   const itemsCopyUpdated = itemsCopy.filter((item) => item.value !== value);
  
    //   // 3. modifier le state avec le setter
    //   setItems(itemsCopyUpdated);
    // };

    const handleDelete = (value) => {
      // 1. copie du state
      const datasCopy = [...data];
  
      // 2. manipulation sur la copie du state
      const datasCopyUpdated = datasCopy.filter((data) => data.value !== value);
  
      // 3. modifier le state avec le setter
      setData(datasCopyUpdated);
    };
  
    // const handleSubmit = (event) => {
    //   event.preventDefault();
  
    //   // 1. copie du state
    //   const itemsCopy = [...items];
  
    //   // 2. manipulation sur la copie du state
    //   const value = new Date().getTime();
    //   const label = newItems;
    //   const itemToAdd = { value, label };
    //   itemsCopy.push(itemToAdd);
  
    //   // 3. modifier le state avec le setter puis vider l'input
    //   setItems(itemsCopy);
    //   setNewItems("");
    // };

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

  const chartRef = useRef(null);

  useEffect(() => {
    const padding = { top: 20, right: 40, bottom: 0, left: 0 };
    const w = 500 - padding.left - padding.right;
    const h = 500 - padding.top - padding.bottom;
    const r = Math.min(w, h) / 3;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3
      .select(chartRef.current)
      .select('svg')
      .append('svg');

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

    const vis = container.append('g');

    const arcs = vis
      .selectAll('g.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    arcs
      .append('path')
      .attr('fill', function (d, i) {
        return color(i);
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

    container.on('click', spin);

    let oldrotation = 0;
    let rotation = 0;
    let picked = 0;
    const oldpick = [];

    function spin(d) {
      container.on('click', null);

      if (oldpick.length === data.length) {
        console.log('done');
        container.on('click', null);
        return;
      }

      const ps = 360 / data.length;
      const pieslice = Math.round(1440 / data.length);
      const rng = Math.floor(Math.random() * 1440 + 360);

      rotation = Math.round(rng / ps) * ps;

      picked = Math.round(data.length - (rotation % 360) / ps);
      picked = picked >= data.length ? picked % data.length : picked;

      if (oldpick.indexOf(picked) !== -1) {
        spin();
        return;
      } else {
        oldpick.push(picked);
      }

      rotation += 90 - Math.round(ps / 2);

      vis
        .transition()
        .duration(3000)
        .attrTween('transform', rotTween)
        .each('end', function () {
          d3.select('.slice:nth-child(' + (picked + 1) + ') path').attr('fill', '#111');
          oldrotation = rotation;

          console.log(data[picked].value);

          container.on('click', spin);
        });
    }

    function rotTween(to) {
      const i = d3.interpolate(oldrotation % 360, rotation);
      return function (t) {
        return 'rotate(' + i(t) + ')';
      };
    }
  }, [data]);

//affichage (render)

  return (
      <div className="winwheel">
        <div id="chart" ref={chartRef}>
          <svg width="500" height="500"></svg>
        </div>
        <ul>
          {data.map((data) => (
            <WheelItem key={data.value} itemInfo={data} onItemDelete={handleDelete} />
          ))}
        </ul>
        <form action="submit" onSubmit={handleSubmit}>
          <input
            value={newDatas}
            type="text"
            placeholder="Ajouter un item"
            onChange={handleChange}
          />
          <button>Ajouter</button>
        </form>
      </div>
    );
};

export default Wheel;