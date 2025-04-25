import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/orders/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        color: '#333',
        marginBottom: '30px'
      }}>
        My Dashboard
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Total Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{orders.length}</p>
        </div>

        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Active Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {orders.filter(order => order.status === 'active').length}
          </p>
        </div>

        <div style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Completed Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {orders.filter(order => order.status === 'completed').length}
          </p>
        </div>
      </div>

      <div style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '2px solid #eee'
                  }}>Order ID</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '2px solid #eee'
                  }}>Date</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '2px solid #eee'
                  }}>Status</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '2px solid #eee'
                  }}>Total</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px',
                    borderBottom: '2px solid #eee'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}>{order._id}</td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: order.status === 'completed' ? '#e0f2e9' : '#fff3e0',
                        color: order.status === 'completed' ? '#1b5e20' : '#e65100'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}>LKR {order.total}</td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <Link
                        to={`/orders/${order._id}`}
                        style={{
                          padding: '6px 12px',
                          background: '#4a90e2',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard; 