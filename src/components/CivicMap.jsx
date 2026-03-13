import React, { useState } from 'react';

const CivicMap = () => {
  const [reports] = useState([
    { id: 'CS-99', type: 'Waste Overflow', loc: 'Hubballi Sector 2', status: 'In Progress' },
    { id: 'CS-102', type: 'Street Light', loc: 'Dharwad Main', status: 'Resolved' }
  ]);

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700' }}>CleanStreet<span style={{ color: '#34d399' }}>.Map</span></h1>
      
      {/* Visual Map Placeholder */}
      <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#34d399', fontSize: '2rem' }}>📍</div>
          <p style={{ fontSize: '12px', opacity: 0.5 }}>GEOSPATIAL NODE ACTIVE: KARNATAKA AREA</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {reports.map(item => (
          <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#34d399' }}>{item.id}</div>
              <div style={{ fontWeight: '600' }}>{item.type}</div>
              <div style={{ fontSize: '13px', opacity: 0.6 }}>{item.loc}</div>
            </div>
            <div style={{ alignSelf: 'center', fontSize: '12px', fontWeight: '700', color: item.status === 'Resolved' ? '#34d399' : '#fb7185' }}>
              {item.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CivicMap;