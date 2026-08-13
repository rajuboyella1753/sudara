import { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api-base";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Share2, Clock, MapPin, Search, Camera, CreditCard, X, 
  PhoneCall, Plus, Minus, ShoppingBag, ShieldCheck, Copy, 
  UtensilsCrossed, MessageSquare, Star, Send, Navigation,ShieldAlert,
  User, CheckCircle2 ,Download
} from "lucide-react";
import VoiceAssistant from "../components/VoiceAssistant";
import QRCode from 'qrcode';
export default function RestaurantProfile() {
  const { id } = useParams();
  const [owner, setOwner] = useState(null);
  // const scrollContainerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const isRestaurant = !owner?.category || owner.category.toLowerCase() === "restaurant";
  const filterOptions = useMemo(() => {
    if (isRestaurant) {
      const cats = ["All", "Veg", "Non-Veg", "General"];
      const itemCats = [...new Set(items.map(i => i.category))].filter(Boolean);
      return [...new Set([...cats, ...itemCats])];
    } else if (owner?.category?.toLowerCase() === "automobile") {
      // 🚗 ఆటోమొబైల్ అయితే ఫ్యూయల్ టైప్స్ ట్యాబ్స్ వస్తాయి
      return ["All", "Petrol", "Diesel", "Electric", "CNG"];
    } else {
      const itemCats = [...new Set(items.map(i => i.category || i.subCategory))].filter(Boolean);
      return ["All", ...itemCats];
    }
  }, [items, isRestaurant, owner]);
  const orderSectionRef = useRef(null);
  const counterPrintButtonRef = useRef(null);
  const [activeSubCat, setActiveSubCat] = useState("All"); 
  const [itemSearch, setItemSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null); 
  const [counterCart, setCounterCart] = useState({});
  const [cart, setCart] = useState({}); 
  const [deliveryType, setDeliveryType] = useState("Take Away");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({ name: "", phone: "", txId: "", arrivalTime: "" ,peopleCount: 1});
  const [showOnlineOrderModal, setShowOnlineOrderModal] = useState(false);
  const [onlineOrderData, setOnlineOrderData] = useState({ name: "", phone: "", address: "" });
  const [showPayWarning, setShowPayWarning] = useState(false); 
  const [selectedTable, setSelectedTable] = useState(""); 
  const [showTracking, setShowTracking] = useState(false);
  const [showMenuPopup, setShowMenuPopup] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [showInstantModal, setShowInstantModal] = useState(false); 
  const [showCallPopup, setShowCallPopup] = useState(false);
  const sudaraId = "SDR" + Math.floor(100 + Math.random() * 900);
  const [orderStatus, setOrderStatus] = useState(null);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [assignedTable, setAssignedTable] = useState(null);
  const [trackedOrderType, setTrackedOrderType] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [recentOrderItems, setRecentOrderItems] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [isClickLocked, setIsClickLocked] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [testDriveData, setTestDriveData] = useState({ name: "", phone: "", date: "" });
  
  {/* 🛒 నాన్-రెస్టారెంట్ స్టోర్స్ ఆర్డర్ మోడల్ కోసం స్టేట్స్ */}
  const [showStoreOrderModal, setShowStoreOrderModal] = useState(false);
  const [storeOrderData, setStoreOrderData] = useState({ name: "", phone: "", address: "" });

  const availableSubCats = useMemo(() => {
  const defaultCats = ["Biryanis", "Starters", "Soups", "Noodles", "Gravys", "Rice", "Breads", "Sea Food", "Tiffins"];
  const catsInMenu = items.map(item => item.subCategory);
  const combined = new Set([...defaultCats, ...catsInMenu]);
  return Array.from(combined).filter(cat => 
    catsInMenu.includes(cat)
  );
}, [items]);

const waTarget = (owner?.whatsappNumber || owner?.phone || "").replace(/[^0-9]/g, '');
const payTarget = owner?.upiNumber || owner?.phone || "No Number Set";
const callTarget = owner?.phone || "";

  const trackFoodInterest = async (itemName) => {
    try {
      const today = getTodayDate();
      await api.put(`/owner/track-analytics/${id}`, {
        action: "food_click",
        foodName: itemName,
        date: today
      });
    } catch (err) { console.log("Interest tracking failed"); }
  };

const trackCallInterest = async () => {
  try {
    const today = new Date().toLocaleDateString('en-GB').split('/').map(n => parseInt(n)).join('/'); 
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "call_click", 
      date: today 
    });
  } catch (err) {
    console.log("Call tracking failed");
  }
};
const handleDirectPay = () => {
  const upiId = owner?.upiID || owner?.phone;
  if (!upiId) return alert("Owner details not found!");

  navigator.clipboard.writeText(upiId);
  
  alert(`UPI ID Copied: ${upiId}\n\nSteps:\n1. Open PhonePe/GPay\n2. Go to 'Pay to UPI ID'\n3. Paste this ID and pay ₹${halfAmount}`);
};
const handleCallAction = () => {
  trackCallInterest();
  setShowCallPopup(true); 
};

const trackPreOrderClick = async () => {
  try {
    const today = getUniversalDate(); 
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "pre_order_click", 
      date: today 
    });
  } catch (err) { console.log("Pre-order track failed"); }
};

const handleStoreDirectOrder = async () => {
  if (!storeOrderData.name || !storeOrderData.phone || !storeOrderData.address) {
    return alert("దయచేసి పేరు, ఫోన్ నంబర్ మరియు అడ్రస్ పూర్తిగా నింపండి! 📝");
  }

  try {
    setLoading(true);
    const itemsTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name} (₹${i.price}) [Img: ${i.image || 'N/A'}]`);
    const generatedSdrId = "SDR" + Math.floor(100 + Math.random() * 900);
    const todayDate = getUniversalDate();
    const payload = {
      restaurantId: id, // ఇది బ్యాకెండ్ లో స్టోర్/వెండర్ ID కి మ్యాప్ అవుతుంది
      customerName: storeOrderData.name,
      customerPhone: storeOrderData.phone,
      customerAddress: storeOrderData.address,
      items: itemList,
      subTotal: Number(itemsTotal.toFixed(2)),
      totalAmount: Number(itemsTotal.toFixed(2)),
      orderType: "Store-Direct-Order", // 👈 ఇది నాన్-రెస్టారెంట్ స్టోర్స్ కోసం ప్రత్యేకమైన టైప్
      sudaraId: generatedSdrId,
      status: "Pending",
      paymentMode: "CASH",
      deliveryType: "Store Home Delivery"
    };

    const res = await api.post("/orders/add", payload);

    if (res.data) {
      await api.put(`/owner/track-analytics/${id}`, { 
        action: "pre_order_click", 
        date: todayDate 
      });
      alert(`ఆర్డర్ విజయవంతంగా పంపబడింది! ✅\nమీ ట్రాకింగ్ ID: ${generatedSdrId}`);
      setPlacedOrderId(generatedSdrId);
      setShowTracking(true);
      setCart({});
      setShowStoreOrderModal(false);
      setStoreOrderData({ name: "", phone: "", address: "" });
    }
  } catch (err) {
    console.error("Store Order Error:", err);
    alert("ఆర్డర్ పంపడం విఫలమైంది. ❌");
  } finally {
    setLoading(false);
  }
};

const trackTestDriveClick = async () => {
  try {
    const today = getUniversalDate(); 
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "pre_order_click",
      date: today 
    });
  } catch (err) { console.log("Test drive track failed"); }
};

const trackPostOrderClick = async () => {
  try {
    const today = getUniversalDate(); 
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "post_order_click", 
      date: today 
    });
  } catch (err) { console.log("Post-order track failed"); }
};

const proceedToCall = async () => {
  try {
    const todayDate = getUniversalDate();
    await api.put(`/owner/track-analytics/${id}`, { 
      action: "call_click", 
      date: todayDate 
    });
  } catch (err) { console.log("Call tracking failed"); }
  finally {
    setShowCallPopup(false);
    window.location.href = `tel:${owner?.phone}`;
  }
};

const handleTrackOrder = async () => {
  const sdrId = document.getElementById("customerSdrId").value;
  if (!sdrId) return alert("Please enter a valid ID!");
  
  try {
    setIsTrackingLoading(true); 
    const res = await api.get(`/orders/status/${sdrId}`);
    setOrderStatus(res.data.status);
    setAssignedTable(res.data.tableNo); 
    setTrackedOrderType(res.data.orderType);
    setPlacedOrderId(sdrId); 
    setShowTracking(true);
  } catch (err) {
    alert("Order not found!");
  } finally {
    setIsTrackingLoading(false);
  }
};

const openGoogleMaps = () => {
  if (!owner?.latitude || !owner?.longitude || owner.latitude === 0) {
    return alert("Restaurant location not set by owner! 📍");
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const restLat = owner.latitude;
        const restLng = owner.longitude;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `https://maps.google.com/maps?saddr=${userLat},${userLng}&daddr=${restLat},${restLng}&directionsmode=walking`;
        } else {
          const mapsURL = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${restLat},${restLng}&travelmode=walking`;
          window.open(mapsURL, "_blank");
        }
      },
      (error) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${owner.latitude},${owner.longitude}`, "_blank");
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  } else {
    alert("Nee browser geolocation support cheyyadam ledu bro! 📍");
  }
};

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const todayDate = getUniversalDate();

      const [oRes, iRes, orderRes] = await Promise.all([
        api.get(`/owner/${id}`),
        api.get(`/items/owner/${id}`),
        api.get(`/orders/restaurant/${id}`)
      ]);
      setOwner(oRes.data);
      setItems(iRes.data);
      setRestaurantOrders(orderRes.data || []);

      const favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
      setIsFavorite(favorites.includes(id));
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };
  if (id) fetchData();
}, [id]);

  const addToCart = (item) => {
    if (isClickLocked) return; 
    setIsClickLocked(true);

    trackFoodInterest(item.name); 
    setCart(prev => ({
      ...prev,
      [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 }
    }));

    setTimeout(() => {
      setIsClickLocked(false);
    }, 300);
  };

  const getUniversalDate = () => {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const restaurantRating = useMemo(() => {
  const count = restaurantOrders.length;
  if (count > 50) return { stars: 5, label: "Elite Hub" };
  if (count > 20) return { stars: 4.5, label: "Popular" };
  if (count > 5) return { stars: 4, label: "Trusted" };
  return { stars: 3.5, label: "New Node" };
}, [restaurantOrders]);

const getTodayDate = () => {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

  const removeFromCart = (item) => {
    setCart(prev => {
      const currentQty = prev[item._id]?.qty || 0;
      if (currentQty <= 1) {
        const { [item._id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item._id]: { ...item, qty: currentQty - 1 } };
    });
  };

  const totalAmount = Object.values(cart).reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const halfAmount = (totalAmount / 2).toFixed(2);
  const calculateTotal = useMemo(() => {
  const itemsTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
  const gstPercentage = owner?.gstPercentage || 0;
  const gstAmount = (itemsTotal * gstPercentage) / 100;
  const extraCharges = (owner?.extraCharges || 0);
  return {
    itemsTotal: itemsTotal,
    gstAmount: gstAmount,
    extraCharges: extraCharges,
    finalTotal: itemsTotal + gstAmount + extraCharges
  };
}, [cart, owner]);

const handleConfirmOrder = async () => {
  if (!orderData.name || !orderData.txId || !orderData.arrivalTime) {
    return alert("Please fill details! 📝");
  }

  try {
    setLoading(true);
    const itemsTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    const gstAmount = (itemsTotal * (owner?.gstPercentage || 0)) / 100;
    const extraCharges = (owner?.extraCharges || 0);
    const finalAmount = itemsTotal + gstAmount + extraCharges;
    const halfAmount = (finalAmount / 2).toFixed(2);

    const sudaraId = "SDR" + Math.floor(100 + Math.random() * 900);
    const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`);
    const todayDate = getUniversalDate();

    const payload = {
      restaurantId: id,
      customerName: orderData.name,
      items: itemList,
      subTotal: Number(itemsTotal.toFixed(2)), 
      gstAmount: Number(gstAmount.toFixed(2)), 
      extraCharges: Number(extraCharges),
      totalAmount: Number(finalAmount.toFixed(2)),
      advancePaid: Number(halfAmount),
      txnId: orderData.txId,
      arrivalTime: orderData.arrivalTime,
      orderType: "Pre-book",
      sudaraId: sudaraId,
      status: "Pending",
      deliveryType: deliveryType,
      peopleCount: Number(orderData.peopleCount) || 1
    };

    const orderRes = await api.post("/orders/add", payload);

    if (orderRes.data) {
      await api.put(`/owner/track-analytics/${id}`, { 
        action: "pre_order_click", 
        date: todayDate 
      });

      await api.put(`/owner/track-sales/${id}`, {
        date: todayDate,
        amount: Number(halfAmount), 
        items: itemList,
        paymentMode: "ONLINE/UPI"
      });

      alert(`ORDER SYNCED! ✅\n\nYour Unique ID: ${sudaraId}`);
      setPlacedOrderId(sudaraId);
      setShowTracking(true);
      setCart({});
      setShowOrderForm(false);
    }
  } catch (err) {
    console.error("Order Sync Error:", err);
    alert("Order Sync Failed! ❌");
  } finally {
    setLoading(false);
  }
};

const handlePrintBill = async (orderObj, manualPaymentMethod = "CASH", ownerData = owner) => {
  try {
    const restaurantName = ownerData?.name?.toUpperCase() || "SUDARA PARTNER";
    const address = ownerData?.address || "Local Neighborhood";
    const phone = ownerData?.phone || "";
    const table = orderObj.tableNo || "PRE";
    const billNo = orderObj.sudaraId || "8760";
    orderObj.paymentMode = manualPaymentMethod.toUpperCase();
    const dateText = new Date(orderObj.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeText = new Date(orderObj.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const configGstPercent = Number(ownerData?.gstPercentage ?? 5);
    const configExtraCharges = Number(ownerData?.extraCharges ?? 0);
    const grandTotal = Number(orderObj.totalAmount || 0);
    const foodTotalInclusive = grandTotal - configExtraCharges;
    const subTotal = Number((foodTotalInclusive / (1 + (configGstPercent / 100))).toFixed(2));
    const totalGst = Number((foodTotalInclusive - subTotal).toFixed(2));
    const cgstAmount = Number((totalGst / 2).toFixed(2));
    const sgstAmount = Number((totalGst / 2).toFixed(2));
    const halfGstPercent = (configGstPercent / 2);
    const gstAmount = (totalAmount * (owner?.gstPercentage || 0)) / 100;
    const finalPayable = totalAmount + gstAmount + (owner?.extraCharges || 0);
    const isAppOnline = orderObj.txnId || (Number(orderObj.advancePaid) > 0) || orderObj.orderType === 'Pre-book' || orderObj.orderType === 'Express-Route';
    const finalPaymentMethod = isAppOnline ? "ONLINE/UPI" : manualPaymentMethod.toUpperCase();

    let tableRowsHTML = "";
    orderObj.items.forEach((itemString) => {
      let qty = 1; let itemName = itemString;
      if (itemString.includes(' x ')) {
        const parts = itemString.split(' x ');
        qty = Number(parts[0]) || 1;
        itemName = parts[1];
      }
      const itemAmount = Number(((grandTotal - configExtraCharges) / (orderObj.items.length || 1)).toFixed(0));
      tableRowsHTML += `
        <tr>
          <td style="text-align: left; padding: 3px 0; font-size: 10.5px; max-width: 24mm; word-wrap: break-word;">${itemName.toUpperCase()}</td>
          <td style="text-align: center; padding: 3px 0; font-size: 10.5px;">${qty}</td>
          <td style="text-align: right; padding: 3px 0; font-size: 10.5px;">${itemAmount}</td>
        </tr>
      `;
    });

    const qrDataUrl = await QRCode.toDataURL(`https://sudara.in/restaurant/${ownerData._id}`, { width: 120, margin: 1, errorCorrectionLevel: 'H' });

    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: 58mm auto; margin: 0; }
          body { width: 48mm; margin: 0 auto; padding: 3mm 0; font-family: 'Courier New', monospace; font-size: 10.5px; line-height: 1.2; }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .header { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
          .divider { border-top: 1px dashed #000; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin: 3px 0; }
          .flex-row { display: flex; justify-content: space-between; padding: 1.5px 0; }
          .total-section { font-size: 12px; font-weight: bold; margin-top: 3px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="header">${restaurantName}</div>
          <div style="font-size: 9px;">${address.toUpperCase()}</div>
          ${phone ? `<div style="font-size: 9px;">PH: ${phone}</div>` : ''}
          <div class="bold" style="margin-top: 3px; font-size: 11px;">BILL NO: ${billNo}</div>
        </div>
        <div class="divider"></div>
        <div class="flex-row"><span>T: ${table}</span><span>DT: ${dateText}</span></div>
        <div class="flex-row"><span>C: ${(orderObj.customerName || "GUEST").toUpperCase()}</span><span>TM: ${timeText}</span></div>
        <div class="divider"></div>
        <table><thead><tr><th style="text-align: left;">ITEM</th><th style="text-align: center;">Q</th><th style="text-align: right;">AMT</th></tr></thead><tbody>${tableRowsHTML}</tbody></table>
        <div class="divider"></div>
        <div class="flex-row"><span>SUB TOTAL</span><span>₹${subTotal.toFixed(2)}</span></div>
        ${configGstPercent > 0 ? `<div class="flex-row"><span>CGST @${halfGstPercent}%</span><span>₹${cgstAmount.toFixed(2)}</span></div><div class="flex-row"><span>SGST @${halfGstPercent}%</span><span>₹${sgstAmount.toFixed(2)}</span></div>` : ''}
        ${configExtraCharges > 0 ? `<div class="flex-row"><span>PACK/SERV CHG</span><span>₹${configExtraCharges.toFixed(2)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="total-section"><div class="flex-row"><span>NET TOTAL</span><span>₹${grandTotal.toFixed(2)}</span></div></div>
        <div class="divider"></div>
        <div class="text-center">
          <div class="bold">INCL. OF ALL TAXES</div>
          <div class="flex-row"><span>PAID BY:</span><span class="bold">${finalPaymentMethod}</span></div>
          <div style="margin: 10px 0;"><img src="${qrDataUrl}" style="width: 100px; height: 100px; display: block; margin: 0 auto;" /></div>
          <p style="font-weight: bold; font-size: 9px;">SCAN TO ORDER AGAIN</p>
          <p style="margin-top: 5px; font-size: 7.5px;">POWERED BY SUDARA.IN</p>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.width = '0'; iframe.style.height = '0';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open(); iframeDoc.write(billHTML); iframeDoc.close();

    const img = iframeDoc.querySelector('img');
    img.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 1000);
    };
  } catch (err) {
    console.error("Bill Error:", err);
  }
};

const handleShare = () => {
  const shareText = `Check out *${owner?.name}* at ${owner?.collegeName} on Sudara Hub! 🍔✨\n\nLink: ${window.location.href}`;
  const waURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waURL, "_blank");
};

const toggleFavorite = () => {
  const favorites = JSON.parse(localStorage.getItem("favRestaurants") || "[]");
  if (isFavorite) {
    const updated = favorites.filter(favId => favId !== id);
    localStorage.setItem("favRestaurants", JSON.stringify(updated));
    setIsFavorite(false);
  } else {
    favorites.push(id);
    localStorage.setItem("favRestaurants", JSON.stringify(favorites));
    setIsFavorite(true);
  }
};

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const table = urlParams.get('table');
  if (table) setSelectedTable(table);
}, []);

const handleInstantOrder = async () => {
  if (!customerName.trim() || !selectedTable) {
    return alert("దయచేసి మీ పేరు మరియు టేబుల్ నంబర్ ఇవ్వండి! 📝");
  }

  try {
    setLoading(true);
    const itemsTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
    const gstPercent = Number(owner?.gstPercentage) || 0; 
    const extra = Number(owner?.extraCharges) || 0;
    const gstAmount = (itemsTotal * gstPercent) / 100;
    const finalTotal = itemsTotal + gstAmount + extra;
    const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`);
    const generatedSdrId = "SDR" + Math.floor(100 + Math.random() * 900);
    
    const payload = {
      restaurantId: id,
      customerName: customerName,
      tableNo: selectedTable,
      items: itemList,
      subTotal: Number(itemsTotal.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      extraCharges: extra,
      totalAmount: Number(finalTotal.toFixed(2)),
      orderType: "Post-book", 
      deliveryType: "Book at Restaurant",
      arrivalTime: "Immediate",
      status: "Pending",
      sudaraId: generatedSdrId
    };

    const res = await api.post("/orders/add", payload);

    if (res.data) {
      setPlacedOrderId(generatedSdrId);
      setShowTracking(true);
      setTrackedOrderType("Post-book");
      alert(`ఆర్డర్ విజయవంతంగా పంపబడింది! 🍲\nమీ ట్రాకింగ్ ID: ${generatedSdrId}`);
      setCart({}); 
      setShowInstantModal(false);
      setCustomerName("");
      setSelectedTable("");
    }
  } catch (err) {
    console.error("Post-Book Order Error:", err);
    alert("ఆర్డర్ విఫలమైంది! ❌");
  } finally {
    setLoading(false);
  }
};

const handleBookTestDrive = async () => {
    if (!testDriveData.name || !testDriveData.phone || !testDriveData.date) {
      return alert("దయచేసి అన్ని వివరాలు నింపండి! 📝");
    }

    try {
      setLoading(true);
      const todayDate = getUniversalDate();
      await api.put(`/owner/track-analytics/${id}`, { 
        action: "pre_order_click",
        date: todayDate 
      });

      const payload = {
        restaurantId: id,
        customerName: testDriveData.name,
        customerPhone: testDriveData.phone,
        vehicleName: selectedVehicle?.name,
        testDriveDate: testDriveData.date
      };

      await api.post("/orders/test-drive/add", payload);
      alert(`బుక్ చేయబడింది! 🚗\nVehicle: ${selectedVehicle?.name}`);
      setShowTestDriveModal(false);
      setTestDriveData({ name: "", phone: "", date: "" });
    } catch (err) {
      console.error("Test Drive Error:", err);
      alert("టెస్ట్ డ్రైవ్ బుకింగ్ విఫలమైంది. ❌");
    } finally {
      setLoading(false);
    }
  };

const searchFiltered = useMemo(() => {
    return items.filter(item => {
      if (item.isAvailable === false) return false;
      let matchesFilter = true;
      if (filter !== "All") {
        if (owner?.category?.toLowerCase() === "automobile") {
          // ⛽ ఆటోమొబైల్ అయితే ఫ్యూయల్ టైప్ తో మ్యాచ్ చేయాలి
          matchesFilter = item.fuelType?.toLowerCase() === filter.toLowerCase();
        } else if (filter === "Veg" || filter === "Non-Veg") {
          matchesFilter = item.category?.toLowerCase() === filter.toLowerCase();
        } else {
          matchesFilter = item.category === filter || item.subCategory === filter;
        }
      }

      const matchesSubCat = activeSubCat === "All" ? true : (item.subCategory === activeSubCat || item.category === activeSubCat);
      const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase());
      
      return matchesFilter && matchesSubCat && matchesSearch;
    });
  }, [items, filter, activeSubCat, itemSearch, isRestaurant, owner]);

  const availableItems = searchFiltered; 

const groupedItems = useMemo(() => {
  const groups = {};
  availableItems.forEach(item => {
    // 💡 ఇది సబ్-క్యాటగిరీ (Bikes/Cars/EV) లేదా కేటగిరీ బట్టి గ్రూప్ చేస్తుంది
    const cat = item.subCategory || item.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}, [availableItems]);

  if (loading && items.length === 0) {
  return (
    <div className="h-screen bg-white flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest text-[10px]">
      Scanning Menu...
    </div>
  );
}

if (!owner || !owner.isApproved) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center select-none animate-fade-in">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
        <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
      </div>
      
      <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-100">
        SUDARA HUB <span className="text-red-500">GRID RESTRICTION</span>
      </h1>
      
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mt-2">
        Node Address Inactive
      </p>

      <div className="mt-6 p-5 bg-white/5 border border-white/10 rounded-2xl max-w-xs">
        <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">
          ⚠️ ఈ రెస్టారెంట్ యొక్క డిజిటల్ మెనూ సర్వీస్ టెంపరరీగా <span className="text-red-400 font-black">SUSPENDED</span> చేయబడింది. దయచేసి క్యాష్ కౌంటర్ దగ్గర ఆర్డర్ ఇవ్వండి.
        </p>
      </div>

      <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest mt-12">
        Powered by Sudara.in | Hyperlocal Ecosystem
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden selection:bg-blue-500/30">
    <div className="sticky top-0 z-[100] bg-white border-b border-slate-100 shadow-sm w-full">
      <Navbar />
    </div>
      
    <div className="relative h-[350px] sm:h-[450px] md:h-[600px] flex items-center justify-center overflow-hidden bg-slate-900 w-full">
      {owner?.hotelImage && (
        <img 
          src={owner.hotelImage} 
          loading="eager" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-40 blur-[0.1px]" 
          alt={owner?.name} 
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#FDFDFD]"></div>
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 text-center px-4 w-full max-w-4xl flex flex-col items-center pt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight text-center"
        >
          {owner?.name}
        </motion.h1>
        
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="text-white/95 font-black uppercase tracking-widest text-[8px] sm:text-[10px] bg-blue-600/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/20 shadow-xl"
          >
            {owner?.collegeName} • {owner?.category === "Restaurant" ? "Exclusive Menu" : "Exclusive Products"}
          </motion.p>

          {owner?.category === 'Restaurant' && (
            <div className="flex items-center gap-1.5 bg-amber-50/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-100 shadow-sm">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-800 tracking-widest italic">
                {restaurantRating.label} ({restaurantRating.stars}⭐)
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-12 flex items-center justify-center gap-3 sm:gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={openGoogleMaps}
            className="flex items-center gap-2 sm:gap-3 bg-white px-6 py-3 md:px-10 md:py-5 rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 group border border-white/30 shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600 group-hover:text-white animate-pulse" />
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest italic">
              {isRestaurant ? "Get Restaurant Route" : `Get ${owner?.category || "Store"} Route`}
            </span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="bg-white p-3.5 md:p-5 rounded-full shadow-2xl text-slate-900 border border-white/30 hover:bg-blue-600 hover:text-white transition-all shrink-0"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleFavorite}
            className="bg-white p-3.5 md:p-5 rounded-full shadow-2xl border border-white/30 group hover:bg-white transition-all shrink-0"
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover:text-red-500'}`} />
          </motion.button>
        </div>
      </div>
    </div>

    <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
      <div className="order-2 lg:order-1 lg:col-span-8 space-y-6 md:space-y-8">
        {(() => {
          if (!owner?.todaySpecial || !owner?.specialTimestamp) return null;
          const now = new Date();
          const msgDate = new Date(owner.specialTimestamp);
          const diffInHours = (now - msgDate) / (1000 * 60 * 60);

          if (diffInHours < 24) {
            return (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-[2.5rem] shadow-xl shadow-orange-100 flex items-center gap-4 relative overflow-hidden border-2 border-white/20"
              >
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Star className="w-7 h-7 fill-white animate-pulse" />
                </div>
                <div className="min-w-0 z-10">
                  <p className="text-[10px] font-black uppercase text-white/90 tracking-[0.2em] leading-none mb-2 italic">Live Special Alert</p>
                  <h3 className="text-xl font-black text-white italic leading-tight uppercase tracking-tighter">{owner.todaySpecial}</h3>
                </div>
                <UtensilsCrossed className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 -rotate-12" />
              </motion.div>
            );
          }
          return null;
        })()}

        {isRestaurant && (
          <div className="flex justify-center mt-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className={`group px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic flex items-center gap-2.5 border backdrop-blur-md shadow-sm transition-all duration-500 ${
                owner?.busyStatus === 'High' || owner?.busyStatus === 'Busy' 
                  ? 'bg-red-500/10 text-red-600 border-red-500/20' 
                  : owner?.busyStatus === 'Medium' 
                  ? 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  owner?.busyStatus === 'High' || owner?.busyStatus === 'Busy' ? 'bg-red-500' : 
                  owner?.busyStatus === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  owner?.busyStatus === 'High' || owner?.busyStatus === 'Busy' ? 'bg-red-500' : 
                  owner?.busyStatus === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'
                }`}></span>
              </span>
              <span className="opacity-90">Rush Level:</span>
              <span className="text-[10px] tracking-tighter italic font-black">
                {owner?.busyStatus || 'Normal'}
              </span>
            </motion.div>
          </div>
        )}

        {owner?.planType === "premium" && owner?.interiorImages?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-800 tracking-widest italic">Ambience</h3>
            </div>
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {owner.interiorImages.map((img, idx) => (
                <img key={idx} src={img} loading="lazy" onClick={() => setSelectedImg(img)} className="w-60 sm:w-72 h-40 sm:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] border shadow-sm shrink-0 cursor-zoom-in" alt="" />
              ))}
            </div>
          </div>
        )}

        {showTracking && (
          <div className="mt-8 p-6 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest italic text-center">
              Track Your Order Status 📦
            </p>
            
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                id="customerSdrId"
                placeholder="Enter Your Tracking ID (e.g. SDR564)" 
                className="bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none border focus:border-blue-400 uppercase text-center"
              />
              
              <button 
                onClick={handleTrackOrder}
                disabled={isTrackingLoading}
                className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all"
              >
                {isTrackingLoading ? "Scanning Status..." : "Check Status 🔍"} 
              </button>
            </div>

            {placedOrderId && (
              <div className="mb-4 p-5 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] text-center mt-4">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Your Order ID</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{placedOrderId}</p>
              </div>
            )}

            {orderStatus && (
              <div className="mt-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center space-y-2">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Current Status</p>
                <p className="text-xl font-black text-blue-600 uppercase italic animate-pulse">
                  🚀 {orderStatus}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase">
                  (ఓనర్ స్టేటస్ మార్చిన వెంటనే ఇక్కడ లైవ్‌లో అప్‌డేట్ అవుతుంది)
                </p>
              </div>
            )}
          
            {assignedTable && 
             assignedTable !== "PRE" && 
             trackedOrderType === "Pre-book" && (
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[2rem] text-center shadow-xl border-2 border-amber-400/40 relative overflow-hidden"
             >
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400 italic leading-none mb-1">Sudara Premium Protocol</p>
              <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-wider">YOUR TABLE IS READY 🪑</h4>
              <p className="text-4xl font-black text-amber-400 tracking-tighter italic mt-3 animate-bounce">
                TABLE # {assignedTable}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                Please walk in and take your seat directly if any doubt call to owner!
              </p>
             </motion.div>
            )}
          </div>
        )}

        <div className="bg-slate-50 border-l-4 border-amber-500 p-4 rounded-2xl mb-6 flex items-start gap-3">
          <Camera className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-relaxed uppercase italic">
            <span className="text-amber-600 font-black">Note:</span> These images are for representation only. Also Sudara is not responsible for any {isRestaurant ? "food" : "product"} related issues in this {isRestaurant ? "restaurant" : "store"}; full responsibility is taken by the {isRestaurant ? "Restaurant" : "Store"} owner only, we are just connectors.
          </p>
        </div>

        <div className="sticky top-16 sm:top-20 z-30 bg-white/95 py-2 border-b space-y-3 sm:space-y-4 backdrop-blur-md">
          <div className="relative">
            <input type="text" placeholder="Search dish..." value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} className="w-full bg-slate-50 border py-2.5 sm:py-3 px-10 rounded-full text-[10px] sm:text-xs font-bold outline-none" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 sm:w-4 h-4" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map((cat, index) => {
              const isSelected = filter === cat;
              let btnStyles = "";
              if (cat === "Veg") {
                btnStyles = isSelected ? "bg-green-600 text-white border-green-600 shadow-md" : "bg-white text-green-600 border-green-200 hover:bg-green-50";
              } else if (cat === "Non-Veg") {
                btnStyles = isSelected ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-white text-red-600 border-red-200 hover:bg-red-50";
              } else {
                btnStyles = isSelected ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50";
              }

              return (
                <button 
                  key={`${cat}-${index}`} onClick={() => setFilter(cat)} 
                  className={`px-4 sm:px-6 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase border transition-all shrink-0 flex items-center gap-1.5 ${btnStyles}`}
                >
                  {cat === "All" && (
                     <div className="flex -space-x-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 border border-white"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 border border-white"></div>
                     </div>
                  )}
                  {cat === "Veg" && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                  {cat === "Non-Veg" && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></div>}
                  {cat !== "All" && cat !== "Veg" && cat !== "Non-Veg" && (
                     <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
                  )}
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setActiveSubCat("All")} 
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border shrink-0 transition-all ${
                activeSubCat === "All" ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              {isRestaurant ? "All Menu" : "All Items"}
            </button>
            {availableSubCats.map(sub => (
              <button key={sub} onClick={() => setActiveSubCat(sub)} className={`px-3 sm:px-4 py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase border shrink-0 transition-all ${activeSubCat === sub ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-400 border-slate-100"}`}>{sub}</button>
            ))}
          </div>
        </div>

        <div className="max-h-[800px] overflow-y-auto pr-1 space-y-8 scrollbar-custom pb-12">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold uppercase text-xs">
              No items found
            </div>
          ) : (
            Object.entries(groupedItems).map(([categoryName, catItems]) => (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center justify-between border-l-4 border-blue-600 pl-3">
                  <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider italic">
                    {categoryName}
                  </h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {catItems.length} Items
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-hide snap-x">
                  {catItems.map((item) => (
                    isRestaurant ? (
                      <div 
                        key={item._id} 
                        className="min-w-[260px] sm:min-w-[280px] max-w-[280px] bg-white p-3 rounded-[1.5rem] border border-slate-100 flex items-center justify-between gap-3 shadow-sm shrink-0 snap-start"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img src={item.image || `https://ui-avatars.com/api/?name=${item.name}`} loading="lazy" className="w-14 h-14 rounded-xl object-cover border shadow-2xs" alt="" />
                            <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white ${item.category === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black uppercase text-[10px] sm:text-[11px] italic text-slate-800 leading-tight truncate">{item.name}</h4>
                            <p className="text-sm font-black text-blue-600 italic mt-0.5">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 bg-slate-50 p-1 rounded-xl border shrink-0">
                          <button onClick={() => addToCart(item)} className="p-1"><Plus className="w-3.5 h-3.5 text-slate-700" /></button>
                          <span className="text-[10px] font-black min-w-[12px] text-center">{cart[item._id]?.qty || 0}</span>
                          <button onClick={() => removeFromCart(item)} className="p-1"><Minus className="w-3.5 h-3.5 text-slate-400" /></button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        key={item._id} 
                        className="min-w-[220px] sm:min-w-[240px] max-w-[240px] bg-white p-4 rounded-[2rem] border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between shrink-0 snap-start"
                      >
                        <div>
                          <div className="relative w-full h-32 bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-2">
                            <img 
                              src={item.image || `https://ui-avatars.com/api/?name=${item.name}`} 
                              loading="lazy" 
                              className="max-h-full max-w-full object-contain" 
                              alt={item.name} 
                            />
                            <span className="absolute top-2 right-2 bg-slate-900 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-md">
                              {item.subCategory || "Hub"}
                            </span>
                          </div>

                          <h4 className="font-black uppercase text-xs text-slate-900 truncate mb-1">
                            {item.name}
                          </h4>

                          {item.category === "Automobile" && (
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              {item.mileageOrRange && (
                                <span className="text-[8px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                                  ⚡ మైలేజ్/liter: {item.mileageOrRange}
                                </span>
                              )}
                              {item.fuelType && (
                                <span className="text-[8px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  ⛽ {item.fuelType}
                                </span>
                              )}
                            </div>
                          )}

                          {item.description && (
                            <div className="max-h-12 overflow-y-auto scrollbar-none my-1 pr-1">
                              <p className="text-[9px] font-medium text-slate-500 leading-snug">
                                {item.description}
                              </p>
                            </div>
                          )}

                          <div className="mt-2">
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                              {item.category === "Automobile" ? "On-Road Price" : "Price"}
                            </p>
                            <p className="text-sm font-black text-blue-600 italic">
                              ₹{item.price}
                            </p>
                            {item.category === "Automobile" && (
                        <p className="text-[7px] font-bold text-slate-400 mt-1 italic leading-tight">
                          * On-Road price subject to change based on RTO and insurance.
                        </p>
                      )}
                          </div>
                        </div>

                        {item.category === "Automobile" ? (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-md ${
  item.isAvailable !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
}`}>
  {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
</span>
                            <button 
                              onClick={() => {
                                setSelectedVehicle(item);
                                setShowTestDriveModal(true);
                              }}
                              className="bg-slate-900 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                            >
                              🚗 Book Test Drive
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">In Stock</span>
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border">
                              <button onClick={() => removeFromCart(item)} className="p-1 bg-white rounded-lg"><Minus className="w-2.5 h-2.5 text-slate-600" /></button>
                              <span className="text-[11px] font-black min-w-[14px] text-center">{cart[item._id]?.qty || 0}</span>
                              <button onClick={() => addToCart(item)} className="p-1 bg-slate-900 text-white rounded-lg"><Plus className="w-2.5 h-2.5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 sm:p-6 my-6 shadow-sm">
          <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-3 mb-4">
            <h3 className="text-[10px] sm:text-xs font-black uppercase text-slate-800 tracking-widest italic">
              {isRestaurant ? "Restaurant & Legal Details" : "Store & Legal Details"}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Owner Name</p>
              <p className="text-xs font-black uppercase italic text-slate-800 truncate">
                {owner?.ownerName || owner?.name || "Sudara Partner"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {isRestaurant ? "FSSAI License No" : "Business License No"}
              </p>
              <p className="text-xs font-black uppercase tracking-wider text-blue-600 truncate">
                {owner?.fssaiNumber && owner.fssaiNumber.trim() !== "" ? owner.fssaiNumber : "Not Provided"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">GST Number</p>
              <p className="text-xs font-black uppercase tracking-wider text-slate-800 truncate">
                {owner?.gstNumber && owner.gstNumber.trim() !== "" ? owner.gstNumber : "Not Provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-4">
        <div ref={orderSectionRef} className="bg-white p-4 rounded-2xl lg:sticky lg:top-32 shadow-lg border border-slate-100 scroll-mt-24">
          
          {isRestaurant ? (
            owner?.planType === "premium" ? (
              <>
                {Object.values(cart).length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[9px] font-black uppercase text-blue-600 italic tracking-widest">Order Summary</span>
                    <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto scrollbar-hide">
                      {Object.values(cart).map((i) => (
                        <div key={i._id || i.name} className="flex justify-between text-[10px] font-bold italic text-slate-600">
                          <span>{i.qty} x {i.name}</span>
                          <span>₹{i.price * i.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-blue-100 pt-3 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Subtotal:</span> <span>₹{calculateTotal.itemsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>GST ({owner?.gstPercentage}%):</span> <span>₹{calculateTotal.gstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Extra:</span> <span>₹{calculateTotal.extraCharges.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-blue-100 pt-3 flex justify-between text-sm font-black italic text-blue-600">
                        <span>Pay Total:</span> <span>₹{calculateTotal.finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  {owner?.tableCount > 0 && (
                    <motion.button  
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        console.log("Post-book button clicked!"); // డిబగ్ చేయడానికి కన్సోల్ లాగ్
                        trackPostOrderClick(); 
                        setShowInstantModal(true);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl font-semibold text-[11px] flex items-center justify-between transition-all border bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/80 shadow-sm cursor-pointer"
                      type="button"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-100/60 rounded-lg">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        </div>
                        <span>Post-Book (At Restaurant)</span>
                      </div>
                      <span className="text-[9px] font-medium text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-md">Dine-in</span>
                    </motion.button>
                  )}

                  <motion.button  
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (totalAmount > 0) { setShowOnlineOrderModal(true); } 
                      else { alert("Please select items first! 🥘"); }
                    }}
                    className="w-full py-3.5 px-4 rounded-xl font-semibold text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 shadow-sm flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100/60 rounded-lg">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span>Order Online (Direct)</span>
                    </div>
                    <span className="text-[9px] font-medium text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-md">Instant</span>
                  </motion.button>

                  {owner?.isPreBookEnabled && (
                    <motion.button  
                      whileHover={totalAmount > 0 ? { scale: 1.01 } : {}}
                      whileTap={totalAmount > 0 ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if (totalAmount > 0) { trackPreOrderClick(); setShowPayWarning(true); } 
                        else { alert("Select items first! 🥘"); }
                      }}
                      className={`w-full py-3.5 px-4 rounded-xl font-semibold text-[11px] flex items-center justify-between transition-all border ${
                        totalAmount > 0 ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200/80 shadow-sm' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-purple-100/60 rounded-lg">
                          <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                        </div>
                        <span>{totalAmount > 0 ? "Pre-Book & Pay Advance" : "Select Items to Pre-Book"}</span>
                      </div>
                      {totalAmount > 0 && <span className="text-[9px] font-medium text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-md">Secure</span>}
                    </motion.button>
                  )}

                  <motion.button  
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCallAction}  
                    className="w-full py-3.5 px-4 rounded-xl font-semibold text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 shadow-sm flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-100/60 rounded-lg">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                      </div>
                      <span>Call to Owner</span>
                    </div>
                    <span className="text-[9px] font-medium text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded-md">Direct</span>
                  </motion.button>
                  
                  <button 
                   onClick={() => setShowTracking(true)}
                   className="w-full mt-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 border"
                  >
                   <Search className="w-3.5 h-3.5" /> Track Existing Order 🔍
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="bg-amber-50 text-amber-800 p-5 rounded-[2rem] border border-amber-200/60 mb-5">
                  <UtensilsCrossed className="w-8 h-8 text-amber-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-[11px] font-black uppercase tracking-wider leading-relaxed">
                    Digital Menu Active ✅
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 leading-relaxed">
                    Online ordering via phone is restricted for this node. Please look at the prices and order directly to server.
                  </p>
                </div>
                <button  
                  onClick={handleCallAction}  
                  className="w-full py-4 rounded-xl font-black uppercase text-[10px] bg-blue-600 text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <PhoneCall className="w-4 h-4" /> Call for Inquiries
                </button>
              </div>
            )
          ) : (
            <div>
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[9px] font-black uppercase text-blue-600 italic tracking-widest">Cart Summary ({owner?.category})</span>
                <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto scrollbar-hide">
                  {Object.values(cart).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No items selected yet.</p>
                  ) : (
                    Object.values(cart).map((i) => (
                      <div key={i._id || i.name} className="flex justify-between text-[10px] font-bold italic text-slate-600">
                        <span>{i.qty} x {i.name}</span>
                        <span>₹{i.price * i.qty}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-blue-100 pt-3 flex justify-between text-sm font-black italic text-blue-600">
                  <span>Total:</span> <span>₹{totalAmount}</span>
                </div>
              </div>

              {/* 🛑 ఇక్కడ ఆటోమొబైల్ కాకపోతేనే ఈ బటన్స్ కనిపిస్తాయి */}
              {owner?.category?.toLowerCase() !== "automobile" && (
                <>
                  <button 
                    onClick={() => {
                      if (Object.keys(cart).length === 0) {
                        return alert("దయచేసి ముందుగా కొన్ని ఐటమ్స్ సెలెక్ట్ చేసుకోండి! 🛍️");
                      }
                      setShowStoreOrderModal(true);
                    }}
                    className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Place Direct Order 🚀
                  </button>

                  <button 
                     onClick={() => setShowTracking(true)}
                     className="w-full mt-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 border"
                  >
                     <Search className="w-3.5 h-3.5" /> Track Existing Order 🔍
                  </button>
                </>
              )}

              <button 
                onClick={() => {
                  trackCallInterest();
                  window.location.href = `tel:${owner?.phone}`;
                }}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" /> Call to Owner 📞
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
    {/* 🪑 1. POST-BOOK / DINE-IN INSTANT TABLE ORDER MODAL */}
  <AnimatePresence>
    {showInstantModal && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-6 shadow-2xl relative text-slate-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black uppercase italic text-slate-900">Dine-in Table Order 🪑</h3>
            <button onClick={() => setShowInstantModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600"><X className="w-4 h-4"/></button>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-wider">మీ పేరు మరియు టేబుల్ నంబర్ ఇవ్వండి</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="మీ పూర్తి పేరు / Full Name" 
              value={customerName} 
              onChange={(e) => setCustomerName(e.target.value)} 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="టేబుల్ నంబర్ / Table Number (e.g. 4)" 
              value={selectedTable} 
              onChange={(e) => setSelectedTable(e.target.value)} 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
            />

            <button 
              onClick={handleInstantOrder}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
            >
              {loading ? "పంపుతోంది..." : "Place Table Order 🍲"}
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* 🛒 2. ONLINE ORDER (DIRECT) MODAL */}
  <AnimatePresence>
    {showOnlineOrderModal && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-6 shadow-2xl relative text-slate-900">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black uppercase italic text-slate-900">Direct Online Order 🛍️</h3>
            <button onClick={() => setShowOnlineOrderModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600"><X className="w-4 h-4"/></button>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-wider">మీ డెలివరీ వివరాలు నమోదు చేయండి</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="మీ పూర్తి పేరు / Full Name" 
              value={onlineOrderData.name} 
              onChange={(e) => setOnlineOrderData({...onlineOrderData, name: e.target.value})} 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="ఫోన్ నంబర్ / Mobile Number" 
              value={onlineOrderData.phone} 
              onChange={(e) => setOnlineOrderData({...onlineOrderData, phone: e.target.value})} 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="డెలివరీ అడ్రస్ / Delivery Address" 
              value={onlineOrderData.address} 
              onChange={(e) => setOnlineOrderData({...onlineOrderData, address: e.target.value})} 
              className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none"
            />

            <button 
              onClick={async () => {
                if (!onlineOrderData.name || !onlineOrderData.phone || !onlineOrderData.address) {
                  return alert("దయచేసి అన్ని వివరాలు నింపండి! 📝");
                }
                try {
                  setLoading(true);
                  const itemsTotal = Object.values(cart).reduce((acc, item) => acc + (item.price * item.qty), 0);
                  const gstPercent = Number(owner?.gstPercentage) || 0; 
                  const extra = Number(owner?.extraCharges) || 0;
                  const gstAmount = (itemsTotal * gstPercent) / 100;
                  const finalTotal = itemsTotal + gstAmount + extra;
                  const itemList = Object.values(cart).map(i => `${i.qty} x ${i.name}`);
                  const generatedSdrId = "SDR" + Math.floor(100 + Math.random() * 900);

                  const payload = {
                    restaurantId: id,
                    customerName: onlineOrderData.name,
                    customerPhone: onlineOrderData.phone,
                    customerAddress: onlineOrderData.address,
                    items: itemList,
                    subTotal: Number(itemsTotal.toFixed(2)),
                    gstAmount: Number(gstAmount.toFixed(2)),
                    extraCharges: extra,
                    totalAmount: Number(finalTotal.toFixed(2)),
                    orderType: "Online-Order", 
                    deliveryType: "Home Delivery",
                    sudaraId: generatedSdrId,
                    status: "Pending",
                    paymentMode: "CASH"
                  };

                  const res = await api.post("/orders/add", payload);
                  if (res.data) {
                    alert(`ఆర్డర్ విజయవంతంగా పంపబడింది! ✅\nట్రాకింగ్ ID: ${generatedSdrId}`);
                    setPlacedOrderId(generatedSdrId);
                    setShowTracking(true);
                    setCart({});
                    setShowOnlineOrderModal(false);
                    setOnlineOrderData({ name: "", phone: "", address: "" });
                  }
                } catch (err) {
                  console.error("Online Order Error:", err);
                  alert("ఆర్డర్ పంపడం విఫలమైంది. ❌");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
            >
              {loading ? "పంపుతోంది..." : "Confirm & Send Order 🚀"}
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
{/* 🚗 TEST DRIVE BOOKING MODAL */}
      <AnimatePresence>
        {showTestDriveModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[350] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-6 shadow-2xl relative text-slate-900">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-black uppercase italic text-slate-900">Book Test Drive 🚗</h3>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">{selectedVehicle?.name}</p>
                </div>
                <button onClick={() => setShowTestDriveModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600"><X className="w-4 h-4"/></button>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="మీ పూర్తి పేరు / Full Name" 
                  value={testDriveData.name} 
                  onChange={(e) => setTestDriveData({...testDriveData, name: e.target.value})} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
                />
                <input 
                  type="text" 
                  placeholder="ఫోన్ నంబర్ / Mobile Number" 
                  value={testDriveData.phone} 
                  onChange={(e) => setTestDriveData({...testDriveData, phone: e.target.value})} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
                />
                <input 
                  type="date" 
                  value={testDriveData.date} 
                  onChange={(e) => setTestDriveData({...testDriveData, date: e.target.value})} 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
                />

                <button 
                  onClick={handleBookTestDrive}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
                >
                  {loading ? "బుక్ అవుతోంది..." : "Confirm Test Drive ✅"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    <AnimatePresence>
      {selectedImg && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
          <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" />
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full backdrop-blur-md"><X /></button>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showMenuPopup && isRestaurant && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 right-4 z-[200] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
        >
          <div>
            <p className="text-xs font-black uppercase italic">
              {isRestaurant ? "Hungry? 🍔" : `Need ${owner?.category || "Items"}? ⚡`}
            </p>
            <p className="text-[9px] text-slate-400 uppercase">
              {isRestaurant ? "Check out our dishes" : "Check out available stock"}
            </p>
          </div>
          
          <button  
            onClick={() => {
              setShowMenuPopup(false);
              const menuGridElement = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2'); 
              if (menuGridElement) {
                menuGridElement.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                window.scrollTo({ top: 500, behavior: "smooth" });
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider shadow-lg active:scale-95 transition-all"
          >
            {isRestaurant ? "Show Menu 👇" : "View Stock 👇"}
          </button>

          <button onClick={() => setShowMenuPopup(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showOrderForm && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0" onClick={() => setShowOrderForm(false)}></div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="bg-slate-900 px-8 py-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                  Confirm <span className="text-blue-400">Order</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Sudara Hub Transmission</p>
              </div>
              <button 
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation(); 
                  setShowOrderForm(false); 
                }}
                className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all active:scale-90 z-[310] cursor-pointer pointer-events-auto flex items-center justify-center border border-white/5"
                type="button"
              >
                <X className="w-4 h-4 pointer-events-none" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-[1.8rem] text-center shadow-sm">
                  <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Pay Advance</p>
                  <p className="text-2xl font-black text-blue-700 italic tracking-tighter">₹{halfAmount}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-[1.8rem] text-center shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pay Later</p>
                  <p className="text-2xl font-black text-slate-900 italic tracking-tighter">₹{halfAmount}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={orderData.name} 
                    onChange={(e)=>setOrderData({...orderData, name:e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner" 
                  />
                </div>
                
                <div className="relative group">
                  <UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" />
                  <div className="relative">
                    <select 
                      value={deliveryType} 
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-[11px] font-black uppercase outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer text-slate-700"
                      style={{ fontSize: '13px' }}
                    >
                      <option value="Take Away">📦 Take Away (Parcel)</option>
                      <option value="Book at Restaurant">🪑 Book at Restaurant (Dining)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Plus className="w-3 h-3 text-slate-400 rotate-45" />
                    </div>
                  </div>
                </div>

                {deliveryType === "Book at Restaurant" && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Number of People" 
                      value={orderData.peopleCount} 
                      onChange={(e) => setOrderData({...orderData, peopleCount: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner" 
                    />
                  </div>
                )}

                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={orderData.arrivalTime} 
                    onChange={(e) => setOrderData({...orderData, arrivalTime: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-[11px] font-black outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner"
                  >
                    <option value="">-- Select Arrival Time --</option>
                    {[
                      "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
                      "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
                      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
                      "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
                    ].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="number" 
                      maxLength="5"
                      placeholder="Txn ID (Last 5)" 
                      value={orderData.txId} 
                      onChange={(e) => {
                        if (e.target.value.length <= 5) {
                          setOrderData({...orderData, txId: e.target.value})
                        }
                      }} 
                      className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-[10px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleConfirmOrder} 
                  className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] italic flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" /> Book Food
                </button>
                <p className="mt-5 text-[8px] font-black text-slate-400 uppercase text-center italic tracking-widest leading-relaxed px-4">
                  * Order verified after <span className="text-slate-900">₹{halfAmount}</span> advance is confirmed.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🛒 నాన్-రెస్టారెంట్ స్టోర్స్ డైరెక్ట్ ఆర్డర్ మోడల్ (ఇది ఇక్కడ ఖచ్చితంగా ఉండాలి!) */}
    <AnimatePresence>
      {showStoreOrderModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] p-6 shadow-2xl relative text-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Direct Store Order</h3>
              <button onClick={() => setShowStoreOrderModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600"><X className="w-4 h-4"/></button>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-4 tracking-wider">మీ వివరాలు నమోదు చేయండి, ఓనర్‌కి ఆర్డర్ వెళ్తుంది</p>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="మీ పూర్తి పేరు / Full Name" 
                value={storeOrderData.name} 
                onChange={(e) => setStoreOrderData({...storeOrderData, name: e.target.value})} 
                className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                placeholder="ఫోన్ నంబర్ / Mobile Number" 
                value={storeOrderData.phone} 
                onChange={(e) => setStoreOrderData({...storeOrderData, phone: e.target.value})} 
                className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none focus:border-blue-500"
              />
              <input 
                type="text" 
                placeholder="డెలివరీ అడ్రస్ / Delivery Address (Hostel/Room/Area)" 
                value={storeOrderData.address} 
                onChange={(e) => setStoreOrderData({...storeOrderData, address: e.target.value})} 
                className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-2xl text-xs font-bold outline-none"
              />

              <button 
                onClick={handleStoreDirectOrder}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
              >
                {loading ? "పంపుతోంది..." : "Confirm & Send Order 🚀"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showPayWarning && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[250] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }} 
            animate={{ scale: 1, y: 0 }} 
            className="bg-white w-full max-w-sm md:max-w-md rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative"
          >
            <div className="bg-slate-50 px-6 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[9px] sm:text-[11px] font-black uppercase text-blue-600 italic">Secure Payment</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-3 sm:w-5 h-1 rounded-full ${i <= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 text-center max-h-[80vh] overflow-y-auto scrollbar-hide">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-2xl font-black uppercase italic text-slate-900 mb-2">Step 1: Confirm First 📞</h3>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase leading-relaxed px-2">
                  Call <span className="text-blue-600 underline">{owner?.name}</span> to check food availability and please dont pay before confirmation.
                </p>
                <button 
                  onClick={handleCallAction} 
                  className="mt-4 w-full py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <PhoneCall className="w-4 h-4" /> Call Owner
                </button>
              </div>
              <div className="w-full h-px bg-slate-100 my-6 relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[8px] sm:text-[10px] font-black text-slate-300 uppercase italic">And Then</span>
              </div>

              <div className="mb-6 sm:mb-8 text-center">
                <div className="bg-slate-900 rounded-[2rem] p-5 sm:p-7 text-white shadow-2xl border-t-4 border-blue-500">
                  <p className="text-[10px] sm:text-[11px] font-black uppercase text-blue-400 mb-4 text-center tracking-widest">Secure Transfer Protocol</p>
                  
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-5">
                    <span className="text-[8px] sm:text-[9px] text-white/40 block mb-2 uppercase tracking-widest font-black text-left">1. Copy Payment Number</span>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight flex items-center justify-between gap-2">
                      <span className="truncate">{payTarget}</span>
                      <button 
                        onClick={() => {
                          const cleanNumber = payTarget.replace(/\D/g, ''); 
                          const finalNumber = cleanNumber.length > 10 ? cleanNumber.slice(-10) : cleanNumber;
                          navigator.clipboard.writeText(finalNumber);
                          alert(`Number Copied: ${finalNumber} ✅\nNow click 'Open Payment App'`);
                        }}
                        className="p-2.5 sm:p-3 bg-blue-600 rounded-xl active:scale-90 shadow-lg flex items-center gap-2 shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-[9px] sm:text-[10px] uppercase font-black">Copy</span>
                      </button>
                    </h2>
                  </div>

                  <div className="mb-5">
                     <span className="text-[8px] sm:text-[9px] text-white/40 block mb-2 uppercase tracking-widest font-black text-center italic">2. Launch & Paste</span>
                     <button 
                       onClick={() => {
                         window.location.href = "phonepe://pay"; 
                         setTimeout(() => {
                           window.location.href = "upi://pay";
                         }, 500);
                       }}
                       className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                     >
                       <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> Open Payment App
                     </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] sm:text-xs border-b border-white/5 pb-2">
                      <span className="text-white/50 italic font-bold">Advance Amount:</span>
                      <span className="font-black text-blue-400 text-xl sm:text-2xl italic">₹{halfAmount}</span>
                    </div>
                    
                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                      <p className="text-[8px] sm:text-[10px] text-blue-200 font-bold leading-tight italic text-center uppercase">
                        Steps: Copy Number ➔ Click Open App ➔ Paste in 'To Mobile Number' ➔ Pay ₹{halfAmount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-6">
                <div className="flex items-center gap-2 mb-1.5 justify-center text-orange-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase italic">Step 3: Copy ID</span>
                </div>
                <p className="text-[9px] sm:text-[11px] font-bold text-orange-700 leading-tight uppercase italic px-2">
                  Paste <span className="underline decoration-2">Last 5 Digits</span> of Txn ID in form.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button 
                  onClick={() => {
                    setShowPayWarning(false);
                    setShowOrderForm(true);
                  }} 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] sm:text-xs tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  I Paid, Continue
                </button>
                <button 
                  onClick={() => setShowPayWarning(false)} 
                  className="text-[10px] sm:text-xs font-black uppercase text-slate-400 hover:text-red-500 transition-colors tracking-widest"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <Footer />
    
    <AnimatePresence>
      {totalAmount > 0 && owner?.planType === "premium" && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4 pointer-events-none"
        >
          <button
            onClick={() => {
              orderSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="w-full bg-slate-950 text-white p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 pointer-events-auto active:scale-95 transition-all"
            type="button"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="bg-blue-600 p-2.5 rounded-xl text-white relative">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 animate-bounce">
                  {Object.values(cart).reduce((acc, curr) => acc + curr.qty, 0)}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Order / Book Now</p>
                <p className="text-sm font-black text-white italic mt-1 leading-none">Total: ₹{totalAmount}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-blue-400 font-black text-[10px] uppercase tracking-widest bg-white/5 py-2 px-4 rounded-xl border border-white/5">
              <span>View Order Details</span>
              <Plus className="w-3 h-3 rotate-45" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {Object.keys(counterCart).length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4 pointer-events-none"
      >
        <button
          type="button"
          onClick={() => {
            counterPrintButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="w-full bg-slate-950 text-white p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 pointer-events-auto active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Counter Order</p>
              <p className="text-sm font-black text-white italic">{Object.keys(counterCart).length} Items Selected</p>
            </div>
          </div>
          <div className="text-blue-400 font-black text-[10px] uppercase bg-white/5 py-2 px-4 rounded-xl border border-white/5">
            Go to Print
          </div>
        </button>
      </motion.div>
    )}
  </div>
);
}