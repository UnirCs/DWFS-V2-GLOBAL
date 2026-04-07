import React, { useContext } from "react";
import "./Profile.css";
import { AuthContext } from "../../context/auth/AuthContext";
import {useLogin} from "../../hooks/useLogin.js";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { logout } = useLogin();

  if (!user) {
    return null; // PrivateRoute se encargará de la redirección
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "entregado": return "status-delivered";
      case "en_proceso": return "status-processing";
      case "pendiente": return "status-pending";
      default: return "status-default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "entregado": return "Entregado";
      case "en_proceso": return "En proceso";
      case "pendiente": return "Pendiente";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-title">
          <h1>Perfil Empresarial</h1>
          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Información de la empresa */}
      <section className="company-info">
        <h2>Información de la Empresa</h2>
        <div className="company-card">
          <div className="company-details">
            <div className="company-name">
              <h3>{user.company.name}</h3>
              <span className="company-sector">{user.company.sector}</span>
            </div>
            <div className="company-grid">
              <div className="detail-item">
                <label>Email:</label>
                <span>{user.company.email}</span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span>{user.company.phone}</span>
              </div>
              <div className="detail-item">
                <label>Dirección:</label>
                <span>{user.company.address}</span>
              </div>
              <div className="detail-item">
                <label>CIF:</label>
                <span>{user.company.cif}</span>
              </div>
              <div className="detail-item">
                <label>Empleados:</label>
                <span>{user.company.employeeCount}</span>
              </div>
              <div className="detail-item">
                <label>Fundada:</label>
                <span>{user.company.founded}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pedidos recientes */}
      <section className="recent-orders">
        <h2>Pedidos Recientes</h2>
        {user.recentOrders.length === 0 ? (
          <div className="no-orders">
            <p>No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="orders-grid">
            {user.recentOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">#{order.id}</h3>
                    <span className="order-date">{formatDate(order.date)}</span>
                  </div>
                  <span className={`order-status ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="order-items">
                  <h4>Productos ({order.items.length})</h4>
                  <div className="items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer">
                  <span className="order-total">
                    Total: {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
