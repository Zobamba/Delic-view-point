import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import SideNav from './SideNav';

const AddOrder = () => {

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);

  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('');

  const [errMsg, setErrMsg] = useState('');
  const [meals, setMeals] = useState();

  const [mealIds, setMealIds] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);

  const addressRef = useRef();
  const errRef = useRef();

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();


  const { setNotification, menuIsOpen, setMenuIsOpen } = useAuth();

  const showNotification = (message, type) => {
    setNotification({ message, type });

    // Auto-hide the notification after a few seconds (e.g., 10 seconds)
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };

  const handleAddMealClick = (meal) => {
    const newMeal = { ...meal, units: 1 };

    setSelectedMeals([...selectedMeals, newMeal]);
    setMealIds([...mealIds, meal.id]);
  }

  const handleRemoveClick = (id) => {
    setSelectedMeals(selectedMeals.filter(item => item.id !== id));
    setMealIds(mealIds.filter(item => item !== id));
  };

  const handleUnitsChange = (e, id) => {
    const meals = selectedMeals;

    const mealIndex = meals.findIndex(item => item.id === id);

    const meal = meals[mealIndex];

    meals[mealIndex] = { ...meal, units: e.target.value };

    setSelectedMeals([...meals]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const meals = selectedMeals.map((item) => { return { mealId: item.id, units: parseInt(item.units) } })

    const payload = { address, phoneNumber, status, meals };
    console.log(payload);

    const id = window.location.href.split("/")[4];

    try {
      const response = await axiosPrivate.put(`/orders/${id}`,
        JSON.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
          withCredentials: true
        }
      );

      console.log(JSON.stringify(response?.data));
      showNotification('Save was successful', 'success');
      navigate(`/orders/${id}`)

    } catch (err) {
      if (!err?.response) {
        setErrMsg('No Server Response!');
      } else if (err.response?.status === 401) {
        setErrMsg('Unauthorized!');
      } else {
        setErrMsg('Failed!')
      }
      errRef.current.focus();
    }
  }

  useEffect(() => {
    const getMeals = async () => {
      try {
        const response = await axiosPrivate.get('/meals', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
          withCredentials: true

        });

        console.log(response.data);
        setMeals(response.data.meals);

      } catch (err) {
        console.error(err);
      }
    }

    const getOrder = async () => {
      const id = window.location.href.split("/")[4];
      try {
        const response = await axiosPrivate.get(`/orders/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
          withCredentials: true
        });

        setSelectedMeals(response.data.order.meals.map((meal) => { return { ...meal, units: meal.orderMeal.units } }));
        setMealIds(response.data.order.meals.map((meal) => meal.id));

        setOrderId(response.data.order.id);
        setAddress(response.data.order.address);

        setPhoneNumber(response.data.order.phoneNumber);
        setStatus(response.data.order.status);

      } catch (err) {
        console.error(err);
        navigate('/sign-in');
      }
    }

    getOrder();
    getMeals();
  }, [axiosPrivate, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call or data loading delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Set loading to false once data is loaded
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="page-wrapper">
        <div className="sidenav">
          <SideNav currentTab="orders" />
        </div>
        <div className="container">
          {
            loading ?
              <LoadingSpinner loading={loading} />
              :
              <div className="row mt">
                <div className="row mt">
                  <div className="card-header">
                    <button onClick={() => setMenuIsOpen(!menuIsOpen)} type="button" className="title-bar">
                      <div className="menu-icon dark" type="button" data-toggle="main-nav"></div>
                    </button>
                    <div className="header-content">
                      <h6 className="mb-0 text-sm">Edit Order</h6>
                    </div>
                  </div>

                  <ol className="breadcrumb">
                    <li><Link to={"/orders"}>Orders</Link></li>
                    <li><Link to={`/orders/${orderId}`}>Order</Link></li>
                    <li>Edit Order</li>
                  </ol>

                  <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

                  <form onSubmit={handleSubmit}>
                    <div className="frm pt-pr">
                      <div className="fm">
                        <div className="add-btn">
                          <button className="button order-btn" type='submit'>Save</button>
                        </div>
                        <label htmlFor="address">Address</label>
                        <input
                          type="text"
                          name="address"
                          ref={addressRef}
                          required="required"
                          value={address}
                          placeholder="Enter an address..."
                          onChange={e => setAddress(e.target.value)} />
                        <label htmlFor="phone">PhoneNumber</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={phoneNumber}
                          required="required"
                          placeholder="Enter a phoneNumber..."
                          onChange={e => setPhoneNumber(e.target.value)} />
                        <label htmlFor="phone">Status</label>
                        <select id="category" name='Select an option' onChange={e => setStatus(e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="hdr">
                      <h6 className="ttl">Order Meals</h6>
                    </div>
                    <div className="table-responsive m-top">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="text-center text-secondary ">Name</th>
                            <th className="text-center text-secondary ">Units</th>
                            <th className="text-center text-secondary">Category</th>
                            <th className="text-center text-secondary ">Price</th>
                            <th className="text-secondary"></th>
                          </tr>
                        </thead>
                        {selectedMeals &&
                          <tbody>
                            {selectedMeals.map((meal, i) => {
                              return (
                                <tr key={i}>
                                  <td className="align-middle">
                                    <Link
                                      to={`/meals/${meal.id}`}
                                      title="View meal"
                                      className="view">
                                      {meal.name}
                                    </Link>
                                  </td>
                                  <td className="align-middle">
                                    <input
                                      type="number"
                                      name="units"
                                      value={meal.units}
                                      min={1}
                                      onChange={(e) => handleUnitsChange(e, meal.id)}
                                    />
                                  </td>
                                  <td className="align-middle">
                                    <span className="category">
                                      {meal.category.charAt(0).toUpperCase() + meal.category.slice(1)}
                                    </span>
                                  </td>
                                  <td className="align-middle">
                                    <span className="font-weight-bold">{meal.price}</span>
                                  </td>
                                  <td className="align-middle">
                                    <div className="actions">
                                      <button
                                        type='button'
                                        className='delete'
                                        onClick={() => handleRemoveClick(meal.id)}>Remove</button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            }
                            )}
                          </tbody>}
                      </table>
                    </div>
                  </form>
                </div>
                <div className="row">
                  <div className="hdr">
                    <h6 className="ttl">Meals Table</h6>
                  </div>
                  <div className="table-responsive m-top">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="text-center text-secondary ">Meal Id</th>
                          <th className="text-center text-secondary ">Name</th>
                          <th className="text-center text-secondary">Category</th>
                          <th className="text-center text-secondary ">Price</th>
                          <th className="text-center text-secondary ">Created</th>
                          <th className="text-center text-secondary ">Updated</th>
                          <th className="text-secondary"></th>
                        </tr>
                      </thead>
                      {meals &&
                        <tbody>
                          {meals.map((meal, i) => {

                            return (
                              <tr key={i}>
                                <td className="align-middle">
                                  <p>#DC40{meal.id}</p>
                                </td>
                                <td className="align-middle">
                                  <Link
                                    to={`/meals/${meal.id}`}
                                    title="View meal"
                                    className="view">
                                    {meal.name}
                                  </Link>
                                </td>
                                <td className="align-middle">
                                  <span className="category">
                                    {meal.category.charAt(0).toUpperCase() + meal.category.slice(1)}
                                  </span>
                                </td>
                                <td className="align-middle">
                                  <span className="font-weight-bold">{meal.price}</span>
                                </td>
                                <td className="align-middle">
                                  <span className="font-weight-bold">{new Date(meal.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}</span>
                                </td>
                                <td className="align-middle">
                                  <span className="font-weight-bold">{new Date(meal.updatedAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}</span>
                                </td>
                                <td className="align-middle">
                                  <button
                                    disabled={Array.isArray(mealIds) ? mealIds.includes(meal.id) : false}
                                    className='button'
                                    onClick={() => handleAddMealClick(meal)}>
                                    Add Meal
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      }
                    </table>
                  </div>
                </div>
              </div>
          }
        </div>
      </div >
    </div>
  );
}

export default AddOrder
