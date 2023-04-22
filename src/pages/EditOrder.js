import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import SideNav from './SideNav';

const AddOrder = () => {

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const [meals, setMeals] = useState();
  const [order, setOrder] = useState();
  const [mealIds, setMealIds] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);

  const addressRef = useRef();
  const errRef = useRef();

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const handleAddMealClick = (meal) => {
    const newMeal = { ...meal, units: 1 };
    setSelectedMeals([...selectedMeals, newMeal]);
    setMealIds([...mealIds, meal.id]);
  }

  const handleRemoveClick = (id) => {
    setSelectedMeals(selectedMeals.filter(item => item.id !== id));
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

    const meals = selectedMeals.map(item => { return { mealId: item.id, units: parseInt(item.units) } })

    const payload = { address, phoneNumber, meals };
    console.log(payload);

    const id = window.location.href.split("/")[4];

    try {
      const response = await axiosPrivate.put(`/orders/${id}`,
        JSON.stringify(payload),
      );
      console.log(JSON.stringify(response?.data));

      navigate("/orders")

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
        });
        setOrder(response.data.order);
        setSelectedMeals(response.data.order.meals.map(meal => { return { ...meal, units: meal.orderMeal.units } }));
        setMealIds(...mealIds, response.data.order.meals.map(meal => meal.id));

      } catch (err) {
        console.error(err);
        navigate('/sign-in', { state: { from: location }, replace: true });
      }
    }

    getOrder(order);
    getMeals();
  }, []);

  return (
    <div className="page-wrapper">
      <SideNav currentTab="orders" />
      <div className="container">
        <div className="row">
          <div className="card-header">
            <h6 className="mb-0 text-sm">  <span><FontAwesomeIcon className="icon-back" icon={faArrowLeft} onClick={() => navigate(-1)} />
            </span> Selected Meals</h6>
          </div>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              ref={addressRef}
              required="required"
              placeholder="Enter an address..."
              onChange={e => setAddress(e.target.value)} />
            <label htmlFor="phone">PhoneNumber</label>
            <input
              type="tel"
              name="phoneNumber"
              ref={addressRef}
              required="required"
              placeholder="Enter a phoneNumber..."
              onChange={e => setPhoneNumber(e.target.value)} />

            <br />
            <br />
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center text-secondary ">Selected Meals</th>
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
                          <td className="align-link">
                            <Link to={`/meals/${meal.id}`}>
                              {meal.name}
                            </Link>
                          </td>
                          <td className="align-middle">
                            <input
                              type="number"
                              name="units"
                              value={meal.units}
                              onChange={(e) => handleUnitsChange(e, meal.id)}
                            />
                          </td>
                          <td className="align-middle">
                            <span className="badge">{meal.category}</span>
                          </td>
                          <td className="align-middle">
                            <span className="font-weight-bold">{meal.price}</span>
                          </td>
                          <td className="align-middle">
                            <button
                              type='button'
                              className='delete'
                              onClick={() => handleRemoveClick(meal.id)}>remove</button>
                          </td>
                        </tr>
                      )
                    }
                    )}
                  </tbody>

                }
              </table>
            </div>
            <br />
            <button
              className="button"
              type='submit'>Save</button>
          </form>
        </div>
        <div className="row">
          <div className="card-header">
            <h6 className="mb-0 text-sm">  <span><FontAwesomeIcon className="icon-back" icon={faArrowLeft} onClick={() => navigate(-1)} />
            </span> Meals table</h6>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-secondary ">#</th>
                  <th className="text-secondary ">Meals</th>
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
                        <td id='id'>
                          <p className="text-xs mb-0">{meal.id}</p>
                        </td>
                        <td>
                          <h6 className="mb-0 text-sm">{meal.name}</h6>
                          <p className="text-xs mb-0">{meal.imageUrl}</p>
                        </td>
                        <td className="align-middle">
                          <span className="badge">{meal.category}</span>
                        </td>
                        <td className="align-middle">
                          <span className="font-weight-bold">{meal.price}</span>
                        </td>
                        <td className="align-middle">
                          <span className="font-weight-bold">{new Date(meal.createdAt).toDateString()}</span>
                        </td>
                        <td className="align-middle">
                          <span className="font-weight-bold">{new Date(meal.updatedAt).toDateString()}</span>
                        </td>
                        <td className="align-middle">
                          <button
                            disabled={mealIds.includes(meal.id)}
                            className='button'
                            onClick={() => handleAddMealClick(meal)}>Add Meal</button>
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
    </div >
  );
}

export default AddOrder
