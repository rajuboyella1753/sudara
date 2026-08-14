  import { useEffect, useState, useMemo, useRef } from "react";
  import { useNavigate } from "react-router-dom";
  import api from "../api/api-base"; 
  import { motion, AnimatePresence } from "framer-motion";
  import Footer from "../components/Footer";
  import { 
    Compass, UtensilsCrossed, Plus, Search, X, Bell, 
    Settings, LogOut, Image as ImageIcon, MapPin, 
    Menu, Power, Calendar, PhoneCall, BarChart3, Star, Send,ShoppingBag, UploadCloud, QrCode, Download, Camera, ShieldCheck, CheckCircle2, Trash2
  } from "lucide-react"; 
  import { QRCodeCanvas } from "qrcode.react";
  import QRCode from 'qrcode';
  // ✅ Correct Path: pages నుండి బయటకి వచ్చి (..), api ఫోల్డర్ లోకి వెళ్ళాలి
  import { socket } from "../api/api-base";
  const defaultMenuOptions = ["Biryanis", "Starters", "Breads", "Egg Items", "Sea Food", "Soups", "Noodles", "Gravys", "Rice", "Tiffins"];

  export default function OwnerDashboard() {
    const navigate = useNavigate();
    const [owner, setOwner] = useState(() => {
      return JSON.parse(localStorage.getItem("owner")) || null;
    });
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]); // Integrated orders feature
    const [allCategories, setAllCategories] = useState(defaultMenuOptions);
    const [loading, setLoading] = useState(true);
    const counterPrintButtonRef = useRef(null);
    const categoryRefs = useRef({});
    // const [counterCart, setCounterCart] = useState({});
    // UI States
    const [activeTab, setActiveTab] = useState("dashboard"); // Tab switching
    const [isMenuOpen, setIsMenuOpen] = useState(false);         
    const [isAddingItem, setIsAddingItem] = useState(false);     
    const [isEditingItem, setIsEditingItem] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false); 
    const [isShowingMatrix, setIsShowingMatrix] = useState(false);
     
    const [sending, setSending] = useState(false);
    const [todayMsg, setTodayMsg] = useState(""); 
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSubCategory, setActiveSubCategory] = useState("All");
    // const counterPrintButtonRef = useRef(null); 
    const orderSectionRef = useRef(null);
    // Profile Form (First Code Fields + New Schema Fields)
    const [profileForm, setProfileForm] = useState({ 
      name: "", email: "", password: "", category: "", phone: "", whatsappNumber: "", upiNumber: "", upiID: "",
      state: "", district: "", collegeName: "", hotelImage: "", address: "", tableCount: 0, foodType: "Both",
      interiorImages: [], latitude: 0, longitude: 0
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All"); 
    const [subCategoryFilter, setSubCategoryFilter] = useState("All"); 
    const [editItemId, setEditItemId] = useState(null);
    const [orderTypeFilter, setOrderTypeFilter] = useState("All"); // 👑 రాజు ఆర్డర్ టైప్ ఫిల్టర్ (All / Pre-book / Post-book)
    // Analytics States (First Code Original)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState("daily");

    const [form, setForm] = useState({ 
      name: "", price: "", discountPrice: "", image: "", category: "Veg", subCategory: "Biryanis" 
    });

    const [isOtherSub, setIsOtherSub] = useState(false);
    const [customSub, setCustomSub] = useState("");
    const [isAlertActive, setIsAlertActive] = useState(() => {
    return localStorage.getItem("sudara_alert_status") === "active";
  });

  // 👑 రాజు సబ్‌స్క్రిప్షన్ ప్లాన్ బి - కొత్త స్టేట్స్ (Separate Modal Logic)
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false); // సపరేట్ మోడల్ ఓపెన్/క్లోజ్
  const [selectedPlanType, setSelectedPlanType] = useState("premium"); // "premium" లేదా "basic"
  const [planDuration, setPlanDuration] = useState(30); // 30 లేదా 90 రోజుల వ్యాలిడిటీ
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [counterCart, setCounterCart] = useState({});
  const SUDARA_UPI_ID = "sudara@ptyes";

  // 👑 రాజు మంత్లీ సబ్‌స్క్రిప్షన్ క్యాలిక్యులేటర్ (డిస్కౌంట్ లేకుండా పక్కా 100% అమౌంట్ లాజిక్)
  const calculatedAmount = useMemo(() => {
    const baseRate = selectedPlanType === "premium" ? 999 : 499;
    const months = planDuration === 90 ? 3 : 1;
    
    // ఎటువంటి డిస్కౌంట్లు లేవు, 3 నెలలకి పక్కా స్ట్రెయిట్ మల్టిప్లికేషన్ రాజు!
    return baseRate * months;
  }, [selectedPlanType, planDuration]);

  // 👑 రాజు సబ్‌స్క్రిప్షన్ రోజుల కౌంట్‌డౌన్ లాజిక్ (Days Remaining Calculator)
  const daysRemaining = useMemo(() => {
    if (!owner?.nextBillingDate) return 0;
    
    const today = new Date();
    const expiry = new Date(owner.nextBillingDate);
    
    // మిల్లీసెకండ్ల నుండి రోజుల్లోకి మారుస్తాం రాజు
    const differenceInTime = expiry.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    // ఒకవేళ రోజులు మైనస్ లోకి వెళ్తే (ఎక్స్‌పైర్ అయితే) 0 చూపిస్తాం
    return differenceInDays < 0 ? 0 : differenceInDays;
  }, [owner]);
useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("owner"));
  if (!stored) { navigate("/owner"); return; }

  if (!socket.connected) { socket.connect(); }
  fetchData(stored._id);

  // 1. సౌండ్ ఆబ్జెక్ట్స్ ఇక్కడ డిక్లేర్ చెయ్
  const orderAudio = new Audio("/order-beep.mp3");
  const delayAudio = new Audio("/delay-beep.mp3");

  const joinRoom = () => socket.emit("join_owner_room", stored._id);

  // 2. handleNewOrder లాజిక్ ఇక్కడ ఉంది
  const handleNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    
    // సౌండ్ ప్లే చేయడానికి ప్రయత్నించు
    if (localStorage.getItem("sudara_alert_status") === "active") {
        // సౌండ్ ప్లే అయ్యే ముందు కరెంటు టైమ్ 0 కి సెట్ చేయడం వల్ల మళ్ళీ ప్లే అవుతుంది
        orderAudio.currentTime = 0; 
        orderAudio.play().catch(e => console.log("Sound play error:", e));
    }
    alert("New Order Received!");
  };

  const handleOrderDelayed = (data) => {
    setOrders((prev) => prev.map(o => o._id === data.orderId ? {...o, scheduledStartTime: data.newTime, isDelayed: true} : o));
    
    delayAudio.currentTime = 0;
    delayAudio.play().catch(e => console.log("Delay sound error"));
  };

  socket.on("connect", joinRoom);
  socket.on("new_order_received", handleNewOrder);
  socket.on("order_delayed", handleOrderDelayed);

  if (socket.connected) joinRoom();

  return () => {
    socket.off("connect", joinRoom);
    socket.off("new_order_received", handleNewOrder);
    socket.off("order_delayed", handleOrderDelayed);
  };
}, []);

// 2. కేటగిరీస్ టాబ్స్ అప్‌డేట్ చేయడానికి (ఇది కొత్తగా యాడ్ చేస్తున్నాం)
useEffect(() => {
  // DB లో ఉన్న ఐటమ్స్ నుండి సబ్-కేటగిరీలను తీసుకోవడం
  const uploadedCats = [...new Set(items.map(i => i.subCategory))].filter(Boolean);
  
  // పర్మనెంట్ లిస్ట్ + అప్‌లోడ్ అయినవి కలిపి సెట్ చేయడం
  const newList = [...new Set([...defaultMenuOptions, ...uploadedCats])];
  
  // నువ్వు కొత్త కేటగిరీ టైప్ చేస్తే (customSub) అది కూడా లిస్ట్ లోకి వస్తుంది
  if (customSub && !newList.includes(customSub)) {
     newList.push(customSub);
  }
  
  setAllCategories(newList);
}, [items, customSub]); // items లేదా customSub మారినప్పుడల్లా ఇది అప్‌డేట్ అవుతుంది

  const fetchData = async (id) => {
  try {
    setLoading(true);
    const [oRes, iRes, ordRes] = await Promise.all([
      api.get(`/owner/${id}`).catch(() => ({ data: null })),
      api.get(`/items/owner/${id}`).catch(() => ({ data: [] })),
      api.get(`/orders/restaurant/${id}`).catch(() => ({ data: [] }))
    ]);

    // 🎯 ఇక్కడ కన్సోల్ లో చెక్ చెయ్
    console.log("🔥 Items received from backend:", iRes.data); 

    if (oRes.data) {
      setOwner(oRes.data);
      setTodayMsg(oRes.data.todaySpecial || "");
      setProfileForm({ ...oRes.data });
    }
    
    setItems(iRes.data || []); // ఇక్కడ ఐటమ్స్ సెట్ అవుతున్నాయి
    setOrders(ordRes.data || []);

  } catch (err) {
    console.error("General Fetch Error:", err);
  } finally {
    setLoading(false);
  }
};

    // --- Logic Functions (First Code Original) ---
    const optimizeImage = (file, callback) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image(); img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800; let w = img.width, h = img.height;
          if (w > MAX) { h *= MAX / w; w = MAX; }
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          callback(canvas.toDataURL("image/jpeg", 0.7)); 
        };
      };
    };

const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSending(true);
    
    // 1. ఇమేజ్ ని ఆప్టిమైజ్ చేసి బేస్-64 గా మార్చు
    optimizeImage(file, async (base64) => {
        try {
            // 2. FormData కి బదులుగా సింపుల్ JSON గా పంపు
            const res = await api.put(`/owner/update-profile/${owner._id}`, { 
                ...profileForm, 
                hotelImage: base64 
            });

            setProfileForm(res.data);
            setOwner(res.data);
            localStorage.setItem("owner", JSON.stringify(res.data));
            alert("Banner Updated successfully! 🚀");
        } catch (err) {
            alert("Image upload failed!");
        } finally {
            setSending(false);
        }
    });
};

    // ఇలా మార్చు
  const handleItemImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file }); 
      const previewUrl = URL.createObjectURL(file);
    }
  };
  const handleInteriorUploads = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      let processedCount = 0;
      const newBase64Images = [];

      files.forEach((file) => {
        optimizeImage(file, (base64) => {
          newBase64Images.push(base64);
          processedCount++;

          if (processedCount === files.length) {
            // 🚀 మెయిన్ ఇమేజ్ పాతది అవ్వకుండా ఇక్కడ కూడా `prev` మ్యాజిక్ వాడుతున్నాం రాజు!
            setProfileForm((prev) => ({
              ...prev,
              interiorImages: [...(prev.interiorImages || []), ...newBase64Images]
            }));
          }
        });
      });

      e.target.value = "";
    };

    const handleGetLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          setProfileForm(p => ({ ...p, latitude, longitude }));
          alert(`Location Locked! ✅`);
        }, null, { enableHighAccuracy: true });
      }
    };

    const handleUpdateSpecial = async () => {
      if (!todayMsg.trim()) return alert("Enter message!");
      setSending(true);
      try {
        const res = await api.put(`/owner/update-profile/${owner._id}`, { ...profileForm, todaySpecial: todayMsg, specialTimestamp: new Date() });
        setOwner(res.data);
        alert("Announcement Published! 🍲");
      } catch (err) { alert("Fail"); }
      finally { setSending(false); }
    };

    const toggleShopStatus = async () => {
      try {
        const res = await api.put(`/owner/update-status/${owner._id}`, { isStoreOpen: !owner.isStoreOpen });
        setOwner(res.data);
        localStorage.setItem("owner", JSON.stringify(res.data));
      } catch (err) { alert("Status Update Failed"); }
    };
  // 👑 1. UPI ఐడీ కాపీ చేసే మ్యాజిక్ మెకానిజం రాజు
    const copyUpiIdToClipboard = () => {
      navigator.clipboard.writeText(SUDARA_UPI_ID);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    // 👑 2. "I Have Paid" సర్వర్ సబ్మిషన్ గేట్‌వే లాజిక్
    const handleCommitRenewal = async () => {
      if (!uploadedReceipt) return alert("దయచేసి పేమెంట్ స్క్రీన్‌షాట్ (Receipt) అప్‌లోడ్ చేయండి! 📸");
      
      setSending(true);
      try {
        const payload = {
          paymentReceipt: uploadedReceipt,
          billingStatus: "Pending Verification", // అడ్మిన్ అప్రూవల్ క్యూ లోకి వెళ్తుంది రాజు
          notes: `Owner requested ${selectedPlanType.toUpperCase()} plan for ${planDuration} Days.`
        };

        await api.put(`/owner/update-profile/${owner._id}`, payload);
        alert("Payment Receipt Sent! 🚀 Your Renewal sent to admin and admin will approve your account soon!");
        setUploadedReceipt(null);
        await fetchData(owner._id); // డ్యాష్‌బోర్డ్ రిఫ్రెష్ చేయడం
      } catch (err) {
        alert("ట్రాన్స్మిషన్ ఫెయిల్ అయింది. మళ్లీ ట్రై చెయ్ రాజు!");
      } finally {
        setSending(false);
      }
    };

 const updateOrderStatus = async (orderId, newStatus) => {
  // 🎯 ఒకవేళ "Delivered" లేదా "Served" అని క్లిక్ చేస్తే అది నేరుగా సేల్స్ లాగింగ్ ఫంక్షన్‌కి వెళ్ళాలి
  if (newStatus === "Delivered" || newStatus === "Served") {
    const order = orders.find(o => o._id === orderId);
    return handleServed(order);
  }

  try {
    await api.put(`/orders/update-status/${orderId}`, { status: newStatus });
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
  } catch (err) {
    alert("Status update failed! ❌");
  }
};
  const handleAssignTable = async (orderId) => {
    // సింపుల్ గా పాపప్ లో అడుగుతున్నాం (లేదా నువ్వు ప్రత్యేకంగా ఇన్‌పుట్ బాక్స్ అయినా పెట్టుకోవచ్చు)
    const tableNum = window.prompt("Enter Table Number for this Pre-booking:");
    
    if (tableNum && tableNum.trim() !== "") {
      try {
        const res = await api.put(`/orders/assign-table/${orderId}`, { tableNo: tableNum });
        
        // UI లో ఆర్డర్స్ ని అప్‌డేట్ చేస్తున్నాం
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, tableNo: tableNum } : o));
        alert(`✅ Table ${tableNum} assigned successfully! Customer notified.`);
      } catch (err) {
        alert("Failed to assign table. Please try again.");
      }
    }
  };
const handleCounterPrint = async () => {
    const selectedItems = items.filter(i => counterCart[i._id] > 0);
    if (selectedItems.length === 0) return alert("కార్ట్ ఖాళీగా ఉంది!");

    const payMode = document.getElementById("counterPayMode")?.value || "CASH";
    const totalCalculatedAmount = selectedItems.reduce((acc, i) => acc + (i.price * counterCart[i._id]), 0);

    const orderObj = {
        customerName: "COUNTER GUEST",
        tableNo: "COUNTER",
        items: selectedItems.map(i => `${counterCart[i._id]} x ${i.name}`),
        totalAmount: totalCalculatedAmount,
        sudaraId: "CT-" + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date(),
        orderType: "Counter-Sale",
        paymentMode: payMode
    };

    try {
        setSending(true);
        const d = new Date();
        const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        
        await api.put(`/owner/track-sales/${owner._id}`, {
            date: dayKey,
            amount: Number(orderObj.totalAmount),
            items: orderObj.items,
            paymentMode: payMode
        });

        await handlePrintBill(orderObj, payMode, owner);
        await fetchData(owner._id); 
        
        setCounterCart({});
        alert("ఆర్డర్ సక్సెస్! సేల్స్ రిపోర్ట్ అప్‌డేట్ అయ్యింది. ✅");
    } catch (err) {
        console.error(err);
        alert("సేల్స్ సేవ్ అవ్వలేదు!");
    } finally {
        setSending(false);
    }
  };

  const handleServed = async (orderObj) => {
    if (!window.confirm("Mark as Served?")) return;

    const selectEl = document.getElementById(`payMode-${orderObj._id}`);
    const selectedMode = selectEl ? selectEl.value : "CASH";

    const totalAmount = Number(orderObj.totalAmount || 0);
    const advancePaid = Number(orderObj.advancePaid || 0);
    const remainingBalance = totalAmount - advancePaid;

    const d = new Date();
    const dayKey = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    
    try {
      await api.put(`/owner/track-sales/${owner._id}`, {
        date: dayKey,
        amount: remainingBalance, 
        items: orderObj.items,
        paymentMode: selectedMode,
        isPreBookingFinalized: true
      });

      await api.put(`/orders/update-status/${orderObj._id}`, { status: "Served" });
      
      setOrders(prev => prev.filter(o => o._id !== orderObj._id));
      await fetchData(owner._id);
      
      alert("Balance Sales Logged Successfully! ✅");
    } catch (err) { 
      console.error(err);
      alert("Failed!"); 
    }
  };
const togglePreBookStatus = async () => {
  try {
    const newStatus = !owner.isPreBookEnabled;
    const res = await api.put(`/owner/update-prebook-status/${owner._id}`, { isPreBookEnabled: newStatus });
    setOwner(res.data);
    alert(`Pre-booking is now ${newStatus ? "ENABLED" : "DISABLED"}!`);
  } catch (err) {
    alert("Status update failed!");
  }
};
const handlePrintBill = async (orderObj, manualPaymentMethod = "CASH", ownerData = owner) => {
  try {
    // 1. డేటా ప్రిపరేషన్ (నీ పాత కోడ్ - ఏదీ మారలేదు) 
    const restaurantName = ownerData?.name?.toUpperCase() || "SUDARA PARTNER";
    const address = ownerData?.address || "Local Neighborhood";
    const phone = ownerData?.phone || "";
    const table = orderObj.tableNo || "PRE";
    const billNo = orderObj.sudaraId || "8760";
    orderObj.paymentMode = manualPaymentMethod.toUpperCase();
    const dateText = new Date(orderObj.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const timeText = new Date(orderObj.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

    const configGstPercent = Number(ownerData?.gstPercentage ?? 5);
    const netAmount = Number((orderObj.totalAmount / (1 + (configGstPercent / 100))).toFixed(2));
    const configExtraCharges = Number(ownerData?.extraCharges ?? 0);
    const grandTotal = Number(orderObj.totalAmount || 0);
    const foodTotalInclusive = grandTotal - configExtraCharges;
    const totalGSTValue = grandTotal - (grandTotal / (1 + (configGstPercent / 100)));
    const basePrice = Number(orderObj.totalAmount) - configExtraCharges;
    const subTotalValue = basePrice / (1 + (configGstPercent / 100));
    const subTotal = Number((foodTotalInclusive / (1 + (configGstPercent / 100))).toFixed(2));
    const totalGst = (grandTotal - configExtraCharges) - subTotalValue;
    const cgstAmount = totalGst / 2;
    const sgstAmount = totalGst / 2;
    const halfGstPercent = (configGstPercent / 2);
    const advancePaid = Number(orderObj.advancePaid || 0);
    const remainingBalance = grandTotal - advancePaid;
    const isAppOnline = orderObj.txnId || (Number(orderObj.advancePaid) > 0) || orderObj.orderType === 'Pre-book' || orderObj.orderType === 'Express-Route';
    const finalPaymentMethod = isAppOnline ? "ONLINE/UPI" : manualPaymentMethod.toUpperCase();

    // 2. టేబుల్ రోస్
   let tableRowsHTML = "";
    const itemsCount = orderObj.items.length || 1;
    // ఒక్కో ఐటమ్ కి టాక్స్ లేని ధర (Sub-total నుండి)
    const unitPrice = subTotalValue / (orderObj.items.length || 1);

    orderObj.items.forEach((itemString) => {
      let qty = 1; let itemName = itemString;
      if (itemString.includes(' x ')) {
        const parts = itemString.split(' x ');
        qty = Number(parts[0]) || 1;
        itemName = parts[1];
      }
      
      // ఐటమ్ ధర (GST లేకుండా)
      tableRowsHTML += `
        <tr>
          <td style="text-align: left; padding: 3px 0; font-size: 10.5px;">${itemName.toUpperCase()}</td>
          <td style="text-align: center; padding: 3px 0; font-size: 10.5px;">${qty}</td>
          <td style="text-align: right; padding: 3px 0; font-size: 10.5px;">${(unitPrice * qty).toFixed(0)}</td>
        </tr>
      `;
    });

    const qrDataUrl = await QRCode.toDataURL(`https://sudara.in/restaurant/${ownerData._id}`, { width: 120, margin: 1, errorCorrectionLevel: 'H' });

    // 3. పూర్తి బిల్ HTML
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
        ${advancePaid > 0 ? `
          <div class="divider"></div>
          <div class="flex-row"><span>ADVANCE PAID</span><span>-₹${advancePaid.toFixed(2)}</span></div>
          <div class="flex-row bold"><span>BALANCE DUE</span><span>₹${remainingBalance.toFixed(2)}</span></div>
        ` : ''}
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

    // 4. ప్రింటింగ్ ఇంజన్
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.width = '0'; iframe.style.height = '0';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open(); iframeDoc.write(billHTML); iframeDoc.close();

    const img = iframeDoc.querySelector('img');
    img.onload = () => {
      iframe.contentWindow.focus();
      
      // ప్రింట్ కమాండ్ ఇచ్చే ముందు ఒక చిన్న ఫ్లాగ్ (Flag) పెట్టు
      let isPrinted = false;

      // ప్రింట్ విండో ప్రింట్ పూర్తయిన తర్వాత కాల్ అయ్యే ఈవెంట్ ఇది
      iframe.contentWindow.onbeforeprint = () => { isPrinted = true; };

      iframe.contentWindow.print();

      // సెట్ టైమౌట్ లో అలర్ట్ ని రన్ చేయి
      setTimeout(async () => {
        if (!isPrinted) {
           // ఒకవేళ ఆల్రెడీ అలర్ట్ చూపించకపోతే
           alert("ఆర్డర్ కంప్లీట్ అయ్యింది & సేల్స్ రిపోర్ట్ అప్‌డేట్ అయ్యింది! ✅");
           await fetchData(owner._id); 
        }
        iframe.remove();
      }, 2000); 
    };
  } catch (err) {
    console.error("Bill Error:", err);
  }
};
const filteredOrders = useMemo(() => {
      if (!orders || orders.length === 0) return [];

      return orders.filter(order => {
        const s = searchTerm ? searchTerm.toLowerCase().trim() : "";
        const nameMatch = (order?.customerName || "").toLowerCase().includes(s);
        const txnMatch = (order?.txnId || "").toLowerCase().includes(s);
        const idMatch = (order?.sudaraId || "").toLowerCase().includes(s);
        const tableMatch = (order?.tableNo || "").toLowerCase().includes(s);
        
        const matchesSearch = !s || nameMatch || txnMatch || idMatch || tableMatch;

        // 🎯 పక్కా ఫిల్టరింగ్ లాజిక్ రాజు!
        let matchesType = true;
        const type = (order?.orderType || "").toLowerCase().trim();
        const delivery = (order?.deliveryType || "").toLowerCase().trim();

        if (orderTypeFilter === "Pre-book") {
          matchesType = type === "pre-book" || type === "pre-order";
        } else if (orderTypeFilter === "Post-book") {
          matchesType = type === "post-book" || type === "post-order" || type === "";
        } else if (orderTypeFilter === "Online-Order") {
          matchesType = type === "online-order" || type === "online-direct"; // కేవలం ఆన్‌లైన్ మాత్రమే వస్తాయి
        }

        return matchesSearch && matchesType;
      });
    }, [orders, searchTerm, orderTypeFilter]);
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // వెడల్పు తగ్గిస్తున్నాం
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          }, "image/jpeg", 0.7); // క్వాలిటీ 70% కి తగ్గిస్తున్నాం
        };
      };
    });
  };
const handleSubmitItem = async (e) => {
  e.preventDefault();
  setSending(true);

  // 1. సబ్-కేటగిరీ నిర్ణయించు
  const finalSub = form.subCategory === "Others" ? customSub : form.subCategory;
  
  // 2. FormData క్రియేషన్
  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("price", form.price);
  formData.append("category", form.category); 
  formData.append("subCategory", finalSub);   
  formData.append("ownerId", owner._id);
  formData.append("isAvailable", "true");

  // 3. ఇమేజ్ అపెండ్
  if (form.image instanceof File) {
    const compressedImage = await compressImage(form.image);
    formData.append("image", compressedImage);
  } else {
    formData.append("image", form.image);
  }

  try {
    if (editItemId) {
      const res = await api.put(`/items/update/${editItemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItems(prev => prev.map(it => it._id === editItemId ? res.data : it));
      alert("Item Updated! ✅");
    } else {
      const res = await api.post("/items/add", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // కొత్త ఐటమ్ యాడ్ అవ్వగానే UI లో కనిపించడానికి
      setItems(prev => [res.data, ...prev]); 
      alert("Item Added! 🚀");
    }
    
    // క్లీనప్
    setIsAddingItem(false); 
    setIsEditingItem(false); 
    setEditItemId(null);
    setForm({ name: "", price: "", image: "", category: "Veg", subCategory: "Biryanis" });
    setCustomSub(""); 
    setIsOtherSub(false);
    fetchData(owner._id); // డేటా రిఫ్రెష్

  } catch (err) {
    console.error(err);
    alert("Operation failed!");
  } finally {
    setSending(false);
  }
};

  const removeInteriorImage = async (imageUrl) => {
    if (!window.confirm("Remove this image from interior?")) return;
    
    try {
      const res = await api.put(`/owner/remove-interior-image/${owner._id}`, { imageUrl });
      setOwner(res.data);
      setProfileForm({ ...res.data });
    } catch (err) {
      alert("Remove failed");
    }
  };
    const getOwnerRangeStats = () => {
      if (!owner?.analytics) return { hits: 0, preOrders: 0, postOrders: 0, calls: 0, totalFoodClicks: 0 };
      const analyticsObj = owner.analytics instanceof Map ? Object.fromEntries(owner.analytics) : owner.analytics;
      let stats = { hits: 0, preOrders: 0, postOrders: 0, calls: 0, totalFoodClicks: 0 };
      let start = new Date(startDate); let end = new Date(endDate); let current = new Date(start);
      while (current <= end) {
        const dKey = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`; 
        const dayData = analyticsObj[dKey] || {};
        stats.hits += Number(dayData.kitchen_entry || 0);
        stats.preOrders += Number(dayData.pre_order_click || 0);
        stats.postOrders += Number(dayData.post_order_click || 0);
        stats.calls += Number(dayData.call_click || 0);
        current.setDate(current.getDate() + 1);
      }
      return stats;
    };

  const downloadQRCode = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const qrCanvas = document.getElementById("qr-gen");
      
      canvas.width = 1200; 
      canvas.height = 1900; // కొంచెం హైట్ పెంచాను స్పేసింగ్ కోసం

      // 1. Background - Premium Dark
      ctx.fillStyle = "#0F172A"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Header Section
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#1E293B");
      gradient.addColorStop(1, "#334155");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, 400);
      ctx.quadraticCurveTo(canvas.width / 2, 480, 0, 400);
      ctx.fill();

      // 3. Digital Menu Titles
      // 3. Hotel Name - Responsive Logic
      const hotelName = owner?.name?.toUpperCase() || "SUDARA HUB";
      
      // పేరు పొడవును బట్టి ఫాంట్ సైజు సెట్ చేయడం
      let fontSize = 90; 
      if (hotelName.length > 15) fontSize = 70;
      if (hotelName.length > 20) fontSize = 55;
      if (hotelName.length > 25) fontSize = 45;

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${fontSize}px sans-serif`; 
      
      // పేరు మరీ పెద్దదైతే పక్కలకు వెళ్лкуండా గరిష్టంగా 1000px వెడల్పులో ఫిట్ చేస్తుంది
      ctx.fillText(hotelName, canvas.width / 2, 230, 1000); 

      // Sub-title spacing
      ctx.fillStyle = "#FACC15"; 
      ctx.font = "bold 40px sans-serif";
      ctx.fillText("PREMIUM DIGITAL MENU", canvas.width / 2, 320);

      // 4. QR Code Container (White Box)
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 60;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(250, 480, 700, 700, 60); 
      ctx.fill();
      ctx.restore();

      // Draw QR Code
      ctx.drawImage(qrCanvas, 325, 555, 550, 550);

      // 🎯 రాజు ఫిక్స్: టేబుల్ నంబర్ రాయడానికి వైట్ స్పేస్ బాక్స్ (QR కింద - HOW TO ORDER కి పైన)
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 45px sans-serif";
      // "TABLE NO:" టెక్స్ట్ ని ప్రింట్ చేస్తున్నాం
      ctx.fillText("TABLE NO : ", canvas.width / 2 - 80, 1240); 
      
      // టేబుల్ నంబర్ పెన్నుతో రాసుకోవడానికి ఒక క్లీన్ వైట్ రెక్టాంగిల్ బాక్స్ రాజు
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 + 60, 1195, 140, 65, 12);
      ctx.fill();
      ctx.restore();

      // 5. Order Path Flow (New Feature)
      ctx.fillStyle = "#FACC15";
      ctx.font = "bold 45px sans-serif";
      ctx.fillText("HOW TO ORDER", canvas.width / 2, 1330); // 💡 టేబుల్ బాక్స్ కోసం కొంచెం కిందకి జరిపాను రాజు

      // Path Logic: Scan > Select > Info > Order
      const pathText = "SCAN ➔ SELECT ITEMS ➔ POST-BOOK ➔ PLACE ORDER";
      ctx.font = "bold 32px sans-serif";
      ctx.fillStyle = "#CBD5E1";
      ctx.fillText(pathText, canvas.width / 2, 1400); // 💡 స్పేసింగ్ అడ్జస్ట్‌మెంట్

      // 6. Professional Steps
      const steps = [
          "1. Open Camera or Scanner", 
          "2. Choose your favorite dishes", 
          "3. Enter details and tap 'Order'"
      ];

      ctx.font = "600 38px sans-serif";
      steps.forEach((text, i) => {
          const barY = 1465 + (i * 90); // 💡 స్పేసింగ్ అడ్జస్ట్‌మెంట్
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.roundRect(200, barY, 800, 70, 15);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(text, canvas.width / 2, barY + 45);
      });

      // 7. Pre-book Message (New Feature)
      ctx.fillStyle = "#38BDF8"; // Light Blue
      ctx.font = "italic bold 32px sans-serif";
      ctx.fillText("💡 Try Pre-booking items before you arrive at our Restaurant!", canvas.width / 2, 1775); // 💡 స్పేసింగ్ అడ్జస్ట్‌మెంట్

      // 8. Footer Branding
      // 🎯 రాజు ఫిక్స్: SUDARA పేరును గోల్డ్ కలర్ తో అల్టిమేట్ గా హైలైట్ చేసాను రా!
      ctx.textAlign = "center";
      ctx.font = "bold 30px sans-serif";
      ctx.fillStyle = "#475569"; // డిఫాల్ట్ గ్రే ఫుటర్ కలర్
      ctx.fillText("POWERED BY ", canvas.width / 2 - 190, 1850);
      
      ctx.fillStyle = "#FACC15"; // 🔥 SUDARA కోసం గోల్డ్ హైలైట్ కలర్!
      ctx.fillText("SUDARA HUB", canvas.width / 2 + 30, 1850);
      
      ctx.fillStyle = "#475569";
      ctx.fillText(" • sudara.in", canvas.width / 2 + 220, 1850);

      // 9. Download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `${owner?.name || "Hub"}_Poster.png`;
      link.click();
  };

// నీ కోడ్‌లో ఉన్న ఫిల్టర్ లాజిక్ ని ఇలా మార్చు:
const filteredItems = items.filter(i => {
    const s = i.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // ఒకవేళ categoryFilter "All" కాకుండా ఏదైనా ఉంటే, అది మ్యాచ్ అవ్వాలి
    const c = categoryFilter === "All" || i.category === categoryFilter;
    
    // సబ్-కేటగిరీ ఫిల్టర్ లో కూడా అలాగే చెక్ చెయ్
    const sc = subCategoryFilter === "All" || i.subCategory === subCategoryFilter;
    
    return s && c && sc;
});


    if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse">LOADING...</div>;
// 1. Keys
const todayKey = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
const currentMonthKey = `${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

// 2. డేటా అడ్రస్ మార్చాం (ఇది నీ DB స్ట్రక్చర్ కి మ్యాచ్ అవుతుంది)
// డేటా నేరుగా analytics ఆబ్జెక్ట్ లో ఉంది, 'daily' కీ లేదు కాబట్టి దాన్ని తీసేయ్
const dailyData = owner?.analytics?.[todayKey] || {}; 
const monthlyData = owner?.analytics?.monthly?.[currentMonthKey] || {};

// 3. Stats Calculation
const dailyStats = {
  revenue: dailyData?.daily_revenue || 0,
  cashSales: dailyData?.cash_sales || 0,
  onlineSales: dailyData?.upi_sales || 0,
  count: dailyData?.total_orders || 0,
  monthlyRevenue: monthlyData?.revenue || 0 
};
// console.log("Filtered Items for UI:", filteredItems);
// console.log("Daily Stats Data:", dailyStats);
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
        
        {/* 👑 NAVBAR (రాజు అల్టిమేట్ రెస్పాన్సివ్ గ్లోబల్ నావ్ - Mobile + Desktop Optimized) */}
  {/* 👑 NAVBAR (మొబైల్ స్పేస్ ఆప్టిమైజ్డ్ లగ్జరీ నావ్ - Mobile + Desktop Fixed) */}
  <nav className="bg-white border-b border-slate-200/80 px-3 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-[60] shadow-sm w-full transition-all duration-300">
    
    {/* 👈 లెఫ్ట్ సెక్షన్: 3 లైన్స్ మెనూ, లోగో, హోటల్ పేరు & సబ్‌స్క్రిప్షన్ కౌంటర్ */}
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 md:flex-none">
      {/* 3 లైన్స్ మొబైల్ మెనూ టోగుల్ బటన్ */}
      <button 
        type="button" 
        onClick={() => setIsMenuOpen(true)} 
        className="p-2.5 bg-slate-50 hover:bg-slate-100 lg:hidden rounded-xl shrink-0 active:scale-90 transition-all border border-slate-100"
      >
        <Menu className="w-4 h-4 text-slate-700 stroke-[2.5]" />
      </button>
      
      {/* హోటల్ లోగో చుక్క */}
      <img 
        src={owner?.hotelImage || "https://via.placeholder.com/50"} 
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-white shadow-md shrink-0" 
        alt="Logo" 
      />
      
      {/* 🎯 స్పేసింగ్ & ఓవర్‌లాప్ ఫిక్స్డ్ టైటిల్ బ్లాక్ */}
      <div className="min-w-0 max-w-[120px] xs:max-w-[160px] sm:max-w-none">
        <h1 className="font-black text-[11px] sm:text-xs md:text-sm uppercase italic tracking-tighter text-slate-900 leading-none truncate">
          {owner?.name}
        </h1>
        <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest shrink-0 hidden xs:block">Dash</p>
          
          {/* ⏳ రోజులు: మొబైల్ లో కూడా పక్కా క్లియర్ గ్యాప్ తో కనిపిస్తుంది */}
          {daysRemaining > 0 ? (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap shrink-0">
              ⏳ {daysRemaining}D Left
            </span>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsRenewalModalOpen(true)} 
              className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase animate-bounce whitespace-nowrap shrink-0 shadow-sm"
            >
              ⚠️ Renew
            </button>
          )}
        </div>
      </div>

      {/* డెస్క్‌టాప్ ట్యాబ్ నావిగేషన్ (పెద్ద స్క్రీన్స్ లో మాత్రమే కనిపిస్తుంది రాజు) */}
      <div className="hidden md:flex items-center gap-6 border-l ml-6 pl-6 shrink-0">
        <button onClick={() => setActiveTab("dashboard")} className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>Menu</button>
        <button onClick={() => setActiveTab("live-orders")} className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "live-orders" ? "text-orange-600 border-b-2 border-orange-600" : "text-slate-400 hover:text-slate-600"}`}>Orders ({orders.length})</button>
        <button onClick={() => setActiveTab("sales-report")} className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "sales-report" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400 hover:text-slate-600"}`}>Sales</button>
        <button onClick={() => setActiveTab("profile")} className={`text-[10px] font-black uppercase italic transition-all pb-1 ${activeTab === "profile" ? "text-purple-600 border-b-2 border-purple-600" : "text-slate-400 hover:text-slate-600"}`}>Login Details</button>
      </div>
    </div>

    {/* 👉 రైట్ సెక్షన్: మొబైల్ లో అస్సలు ఇరుకు లేకుండా కేవలం 2 మెయిన్ యాక్షన్స్ మాత్రమే రాజు! */}
    <div className="flex items-center gap-2 shrink-0">
      
      {/* 🎯 డెస్క్‌టాప్ కి మాత్రమే పరిమితం చేసిన అడ్వాన్స్‌డ్ బటన్స్ (మొబైల్ లో కంప్లీట్ హైడ్!) */}
      <button 
        type="button" 
        onClick={() => setIsShowingMatrix(true)} 
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-xl font-black uppercase italic text-[9px] border border-slate-100 transition-all active:scale-90"
      >
        <BarChart3 className="w-4 h-4" /> Matrix
      </button>

      <button 
        type="button" 
        onClick={() => setIsEditingProfile(true)} 
        className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-black uppercase italic text-[9px] border border-slate-100 transition-all active:scale-90"
      >
        <Settings className="w-4 h-4" /> Settings
      </button>

      <button 
        type="button" 
        onClick={() => setIsRenewalModalOpen(true)} 
        className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl font-black uppercase italic text-[9px] shadow-sm border border-orange-600/30 transition-all active:scale-90"
      >
        <QrCode className="w-4 h-4" /> Renew Node
      </button>

      {/* 🔴 CLOSE / LIVE బటన్ (మొబైల్ & డెస్క్‌టాప్ రెండింటిలోనూ హైలైట్ అవుతుంది) */}
      <button 
        type="button" 
        onClick={toggleShopStatus} 
        className={`text-[9px] sm:text-[10px] font-black uppercase px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border italic shadow-sm transition-all active:scale-95 whitespace-nowrap ${
          owner?.isStoreOpen 
            ? 'bg-white border-red-200 text-red-500 hover:bg-red-50/60' 
            : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'
        }`}
      >
        <span className="sm:hidden">{owner?.isStoreOpen ? 'Close' : 'Live'}</span>
        <span className="hidden sm:inline">{owner?.isStoreOpen ? 'End Service' : 'Go Live'}</span>
      </button>

      {/* 🚪 లాగౌట్ బటన్ (ప్రతి స్క్రీన్ మీద ఎండ్ పాయింట్ లాక్!) */}
      <button 
        type="button" 
        onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} 
        className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl active:scale-95 transition-all shrink-0 flex items-center justify-center shadow-md border border-slate-950"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4 stroke-[2.5]" />
      </button>
      
    </div>
  </nav>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
          
{activeTab === "dashboard" && (
  <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto pb-20 relative px-2">
    {/* 🔔 ALERT SOUND TOGGLE BUTTON (Nav బార్ లో ఇలా యాడ్ చెయ్) */}
<button 
  type="button"
  onClick={() => {
    const newStatus = isAlertActive ? "inactive" : "active";
    localStorage.setItem("sudara_alert_status", newStatus);
    setIsAlertActive(!isAlertActive);
    // బటన్ క్లిక్ చేసినప్పుడు ఒక చిన్న సౌండ్ ప్లే చేస్తే బ్రౌజర్ ఆటో-ప్లే కి పర్మిషన్ ఇస్తుంది
    if (newStatus === "active") {
        new Audio("/order-beep.mp3").play().catch(e => console.log("Sound permission pending"));
        alert("Alert Sound Enabled! 🔊");
    } else {
        alert("Alert Sound Disabled! 🔇");
    }
  }}
  className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
    isAlertActive 
      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
      : 'bg-slate-50 border-slate-200 text-slate-400'
  }`}
  title="Toggle Alert Sound"
>
  <Bell className={`w-4 h-4 ${isAlertActive ? 'fill-emerald-600' : ''}`} />
</button>
    {/* 1. స్టిక్కీ హెడర్ (Add Dish & Search) */}
    <section className="bg-[#F8FAFC] pb-4 pt-2 sticky top-0 z-50">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">Kitchen</h2>
        <button onClick={() => setIsAddingItem(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Add New Dish
        </button>
      </div>
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search dish..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-[11px] font-bold shadow-sm" />
      </div>
    </section>
{/* బిల్లు ప్రింట్ సెక్షన్ (ఇది ఇప్పుడు పైన ఉంటుంది) */}
<div ref={counterPrintButtonRef} className="bg-white p-6 rounded-3xl shadow-md mb-6 border-2 border-emerald-100">
  <h3 className="font-black uppercase italic mb-4 text-emerald-700">Counter Order Cart</h3>
  <select id="counterPayMode" className="w-full p-3 border rounded-xl text-[10px] font-bold uppercase">
    <option value="CASH">💵 CASH</option>
    <option value="ONLINE/UPI">📱 ONLINE/UPI</option>
  </select>
  <button 
    onClick={handleCounterPrint} 
    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase mt-4 active:scale-95 transition-all"
  >
    Print Bill & Reset
  </button>
</div>
    {/* 2. ఫిల్టర్ బటన్స్ */}
    <div className="space-y-4 mb-6">
      {/* Category (Veg/Non-Veg) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Veg", "Non-Veg"].map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap border transition-all ${categoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-white'}`}>{cat}</button>
        ))}
      </div>
      {/* Sub-Category (Biryani, Starters etc) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All", ...allCategories].map(sub => (
          <button key={sub} onClick={() => setSubCategoryFilter(sub)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap border transition-all ${subCategoryFilter === sub ? 'bg-blue-600 text-white' : 'bg-white'}`}>{sub}</button>
        ))}
      </div>
    </div>

    {/* 3. హారిజాంటల్ స్క్రోలింగ్ ఐటమ్స్ */}
    <section className="space-y-6 pb-10">
      {allCategories.map((cat) => {
        // ఇక్కడ filteredItems ని వాడుతున్నాం, సో ఫిల్టర్స్ కచ్చితంగా పనిచేస్తాయి
        const categoryItems = filteredItems.filter(i => (i.subCategory || "Biryanis") === cat);
        if (categoryItems.length === 0) return null;

        return (
          <div key={cat} className="space-y-2">
            <h3 className="text-sm font-black uppercase italic text-slate-800 pl-2">{cat}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
              {categoryItems.map(i => (
                <div key={i._id} className="min-w-[160px] w-[160px] bg-white p-3 rounded-[2rem] border shadow-sm shrink-0 transition-transform hover:scale-[1.02]">
                  <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-3 bg-slate-50">
                    <img src={i.image} className="w-full h-full object-cover" alt={i.name} />
                  </div>
                  <h4 className="font-black text-[10px] uppercase truncate">{i.name}</h4>
                  <p className="text-[9px] text-blue-500 uppercase font-bold">{i.category}</p>
                  <p className="text-xs font-black text-slate-900 mt-1">₹{i.price}</p>
                  
                  <div className="flex flex-col gap-2 mt-3">
                    <button onClick={() => setCounterCart(prev => ({ ...prev, [i._id]: (prev[i._id] || 0) + 1 }))} className="w-full bg-blue-600 text-white py-2 rounded-xl text-[9px] font-black uppercase">Add</button>
                    <button onClick={() => setCounterCart(prev => {
        const newCart = { ...prev };
        if (newCart[i._id] > 0) newCart[i._id] -= 1;
        if (newCart[i._id] === 0) delete newCart[i._id];
        return newCart;
    })} className="px-3 bg-red-100 text-red-600 rounded-xl text-[9px] font-black uppercase">Remove</button>
                    <div className="flex gap-1">
                      <button onClick={() => api.put(`/items/update-availability/${i._id}`, { isAvailable: !i.isAvailable }).then(res => setItems(prev => prev.map(it => it._id === i._id ? res.data : it)))} className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase border ${i.isAvailable ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{i.isAvailable ? 'Live' : 'Sold'}</button>
                      <button onClick={() => { setForm({ ...i }); setEditItemId(i._id); setIsEditingItem(true); }} className="px-3 bg-slate-100 text-slate-600 rounded-xl text-[8px] font-black">Edit</button>
                      <button onClick={async () => { if(window.confirm("Remove?")) { await api.delete(`/items/delete/${i._id}`); setItems(items.filter(it => it._id !== i._id)); } }} className="px-3 bg-red-100 text-red-500 rounded-xl text-[8px] font-black"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
    
  </div>
)}

              {/* PAGE 2: LIVE ORDERS (Responsive Grid UI) */}
              {activeTab === "live-orders" && (
                owner?.planType === "premium" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-4xl font-black italic uppercase text-slate-900">
                      Live<br/><span className="text-orange-500">Orders Feed</span>
                    </h2>
                    
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search by Name, Type (Pre/Post) or Txn ID..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full bg-white border border-slate-200 p-4 pl-11 rounded-2xl text-xs font-bold outline-none shadow-sm focus:border-orange-400 transition-all"
                      />
                    </div>
                              <button 
                        onClick={togglePreBookStatus} 
                        className={`group relative flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg ${
                          owner?.isPreBookEnabled 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' 
                            : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                        }`}
                      >
                        {/* స్టేటస్ ని బట్టి ఒక చిన్న లైవ్ డాట్ */}
                        <span className={`relative flex h-2 w-2`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${owner?.isPreBookEnabled ? 'bg-white' : 'bg-white'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 bg-white`}></span>
                        </span>
                        
                        {owner?.isPreBookEnabled ? "Pre-Booking Enabled" : "Pre-Booking Disabled"}
                      </button>
  {/* 🚀 రాజు స్మార్ట్ ఆర్డర్ టైప్ స్విచ్ బటన్స్ */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit mt-3">
          {[
            { id: "All", label: "All Feeds" },
            { id: "Pre-book", label: "Pre-Bookings 🚗" },
            { id: "Post-book", label: "Post-Orders 🪑" },
            { id: "Online-Order", label: "Online Orders 📦" }
          ].map(tab => (
            <button 
              key={tab.id} 
              type="button" 
              onClick={() => setOrderTypeFilter(tab.id)} 
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${orderTypeFilter === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full p-20 text-center text-slate-300 font-black uppercase italic bg-white rounded-[2.5rem] border border-dashed">
              {searchTerm ? "No matching results found ❌" : "No Active Orders"}
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all relative overflow-hidden">
                
                {/* 🏷️ NEW: Order Type Ribbon (Pre/Post Order/Express) */}
                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase italic text-white ${order.orderType === 'Pre-Order' ? 'bg-purple-600' : order.orderType === 'Express-Route' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                  {order.orderType || 'Post-Order'}
                </div>

                <div>
  <div className="flex justify-between items-start mb-4">
    <div>
      <p className="font-black uppercase italic text-lg text-slate-900 leading-tight">
        {order.customerName}
      </p>
{/* 📦 పార్శిల్ లేదా డైన్-ఇన్ క్లియర్ బ్యాడ్జ్ */}
     <div className="mt-1.5 flex items-center gap-2">
       <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
         order.deliveryType === 'Take Away' 
           ? 'bg-amber-100 text-amber-800 border border-amber-200' 
           : order.deliveryType === 'Book at Restaurant' 
           ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
           : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
       }`}>
         {order.deliveryType === 'Take Away' ? '📦 Parcel (Take Away)' : order.deliveryType === 'Book at Restaurant' ? '🪑 Dine-In (Restaurant)' : '🛍️ Direct Order'}
       </span>
     </div>
      {/* 📍 ఆన్‌లైన్ ఆర్డర్‌ల కోసం అడ్రస్ మరియు ఫోన్ నంబర్ డిస్‌ప్లే */}
      {order.customerAddress && (
        <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase">
          📍 Address: {order.customerAddress}
        </p>
      )}
      {order.customerPhone && (
        <p className="text-[10px] font-bold text-blue-600 mt-0.5 uppercase">
          📞 Phone: {order.customerPhone}
        </p>
      )}

      {/* 🎯 పోస్ట్-బుకింగ్ కి టేబుల్ నంబర్ కనిపిస్తుంది */}
      {(order.orderType?.toLowerCase() === "post-book") && (
        <div className="bg-blue-50 px-4 py-2 rounded-2xl text-center flex flex-col justify-center border border-blue-100 shadow-sm mt-2">
          {/* <p className="text-[8px] font-black text-blue-400 uppercase leading-none">Table No</p> */}
          {/* <p className="text-xl font-black text-blue-600 leading-none mt-1">
            # {order.tableNo ? order.tableNo : "?"}
          </p> */}
        </div>
      )}
      {order.sudaraId && (
        <div className="mt-1 flex gap-2 items-center">
          <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded border border-blue-200 uppercase italic">
            ID: {order.sudaraId}
          </span>
        </div>
      )}
     
      {order.orderType === "Pre-book" && (
        <p className="text-[10px] font-black text-orange-600 uppercase mt-1 italic">
          🚗 Coming at: {order.arrivalTime} 
        </p>
      )}
    </div>
  {order.orderType === "Pre-book" && (
    <div className="flex gap-2 mt-2">
      <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase italic border border-amber-200">
        👥 {order.peopleCount || 1}
      </span>
    </div>
  )}
  {order.deliveryType === "Book at Restaurant" && (
    <div className="bg-blue-50 px-4 py-2 rounded-2xl text-center flex flex-col justify-center">
      <p className="text-[8px] font-black text-blue-400 uppercase leading-none">Table</p>
      <p className="text-xl font-black text-blue-600 leading-none mt-1">
        # {order.tableNo !== "PRE" && order.tableNo ? order.tableNo : "?"}
      </p>
      
      {(!order.tableNo || order.tableNo === "PRE") && (
        <button 
          onClick={() => handleAssignTable(order._id)}
          className="mt-2 text-[8px] bg-blue-600 text-white px-2 py-1 rounded-lg font-bold hover:bg-blue-700 transition-all"
        >
          Assign Table
        </button>
      )}
    </div>
  )}
  </div>

  {/* Items List */}
  <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto scrollbar-hide p-1">
    {order.items.map((it, idx) => (
      <span key={idx} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase border border-slate-100 italic shrink-0">
        {it}
      </span>
    ))}
  </div>

  {/* 🕒 EXPRESS ROUTE TIMER & DELAY ALERT */}
  {order.orderType === 'Express-Route' && (
    <div className={`mt-3 p-3 rounded-2xl border ${order.isDelayed ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${order.isDelayed ? 'bg-red-500' : 'bg-blue-500'}`}></div>
        <p className="text-[9px] font-black uppercase text-slate-500">
          {order.isDelayed ? '⚠️ CUSTOMER DELAYED' : '🕒 EXPRESS START TIME'}
        </p>
      </div>
      <p className="text-sm font-black text-slate-900 mt-1 tracking-tight">
        {new Date(order.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </p>
    </div>
  )}

  {order.txnId && (
    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 mb-4 mt-4">
      <p className="text-[8px] font-black text-emerald-400 uppercase">Transaction ID</p>
      <p className="text-[10px] font-bold text-emerald-700 break-all">{order.txnId}</p>
    </div>
  )}
</div>

                {/* 🎯 అమౌంట్ మరియు యాక్షన్ బటన్స్ సెక్షన్ */}
                <div className="pt-4 border-t border-slate-50 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                  {/* 🎯 క్లీన్ అమౌంట్ & స్టేటస్ సెక్షన్ */}
                  <div className="pt-4 border-t border-slate-100 mt-2 space-y-4">
                    
                    {/* టోటల్, పెయిడ్, బ్యాలెన్స్ ఒకే లైన్ లో */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Total</p>
                        <p className="text-sm font-black text-slate-900">₹{order.totalAmount}</p>
                      </div>
                      
                      {order.advancePaid > 0 && (
                        <div>
                          <p className="text-[8px] font-black text-orange-500 uppercase">Paid</p>
                          <p className="text-sm font-black text-orange-600">₹{order.advancePaid}</p>
                        </div>
                      )}

                      {order.advancePaid > 0 && (
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">Pending</p>
                          <p className="text-sm font-black text-emerald-800">₹{order.totalAmount - order.advancePaid}</p>
                        </div>
                      )}
                    </div>

  {/* 🎯 బ్యాలెన్స్ పేమెంట్ మోడ్ సెలక్షన్ (కేవలం బ్యాలెన్స్ ఉంటేనే కనిపిస్తుంది) */}
            {order.advancePaid > 0 && (
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between px-3">
                <span className="text-[8px] font-black text-slate-500 uppercase">Balance Mode:</span>
                <select 
                  id={`payMode-${order._id}`} 
                  className="bg-transparent text-[9px] font-black uppercase text-slate-700 outline-none cursor-pointer"
                >
                  <option value="CASH">💵 CASH</option>
                  <option value="ONLINE/UPI">📱 ONLINE / UPI</option>
                </select>
              </div>
            )}
          </div>

                    {/* స్టేటస్ ని బట్టి రంగు మారుతుంది */}
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase italic ${order.status === 'Preparing' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {order.status || 'Pending'}
                    </div>
                  </div>

        <div className="flex flex-col gap-2 w-full pt-2">
  {/* టాప్ యాక్షన్ రో: Accepted & Preparing */}
  <div className="flex gap-2 w-full">
    <button 
      onClick={() => updateOrderStatus(order._id, "Accepted")}
      className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-sm active:scale-95 transition-all"
    >
      Accepted
    </button>

    <button 
      onClick={() => updateOrderStatus(order._id, "Preparing")}
      className="flex-1 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-sm active:scale-95 transition-all"
    >
      Preparing
    </button>
  </div>

{/* Online-Order aithe matrame Delivery status buttons chupinchali */}
{order.orderType === 'Online-Order' && (
  <div className="flex gap-2 w-full mt-1">
    <button 
      onClick={() => updateOrderStatus(order._id, "Out for Delivery")}
      className="flex-1 py-3 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-sm active:scale-95 transition-all"
    >
      Out for Delivery 🛵
    </button>
    <button 
      onClick={() => updateOrderStatus(order._id, "Delivered")}
      className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all"
    >
      Delivered ✅
    </button>
  </div>
)}

  {/* 🎯 రాజు మ్యాజిక్: కౌంటర్ దగ్గర ఫోన్‌పే/UPI లేదా క్యాష్ అని సెలెక్ట్ చేసుకునే క్విక్ గేట్‌వే (Only for counter orders) */}
  {!order.txnId && order.orderType === "Post-book" && (
    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 gap-2 mt-1">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-1">Counter Pay Mode:</span>
      <select 
        id={`payMode-${order._id}`}
        className="p-1.5 bg-white border border-slate-300 rounded-lg text-[9px] font-black text-slate-700 uppercase outline-none focus:border-blue-500"
        defaultValue="CASH"
      >
        <option value="CASH">💵 CASH</option>
        <option value="ONLINE/UPI">📱 PHONEPE / UPI</option>
      </select>
    </div>
  )}

  {/* బాటమ్ యాక్షన్ రో: Print Bill & Served */}
  <div className="flex gap-2 w-full mt-1">
    <button 
      type="button"
      onClick={() => {
        const selectEl = document.getElementById(`payMode-${order._id}`);
        const chosenMode = selectEl ? selectEl.value : "CASH";
        handlePrintBill(order, chosenMode);
      }}
      className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-950"
    >
      <span>Print Bill</span> <span>🖨️</span>
    </button>

   {/* Kevalam Pre-book mariyu Post-book order types aithe matrame 'Served' button chupinchali */}
{(order.orderType === 'Pre-book' || order.orderType === 'Post-book') && (
  <button 
    onClick={() => handleServed(order)}
    className="flex-1 py-3 bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase italic shadow-lg active:scale-95 transition-all"
  >
    Served ✅
  </button>
)}
  </div>
</div>
                </div>
              </div>
              
            ))
          )}
        </div>
      </motion.div>
    ) : (
      <UpgradeBanner /> 
    )
  )}

  {/* PAGE 3: SALES REPORT */}
  {activeTab === "sales-report" && (
    owner?.planType === "premium" ? (
      <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
        <h2 className="text-4xl font-black italic uppercase text-slate-900">Sales<br/><span className="text-emerald-500">Matrix</span></h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {/* రెవెన్యూ బాక్స్ */}
   <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <p className="text-[10px] uppercase opacity-50">Total Revenue</p>
            <h3 className="text-3xl font-black">₹{dailyStats.revenue}</h3>
          </div>
{/* 2. Monthly Revenue బాక్స్ - కొత్తగా యాడ్ చేసింది */}
  <div className="bg-purple-600 p-8 rounded-[2rem] text-white">
    <p className="text-[10px] uppercase opacity-80">Monthly Revenue</p>
    <h3 className="text-3xl font-black">₹{dailyStats.monthlyRevenue}</h3>
  </div>
          {/* Cash బాక్స్ */}
          <div className="bg-emerald-500 p-8 rounded-[2rem] text-white">
            <p className="text-[10px] uppercase opacity-80">Cash Sales</p>
            <h3 className="text-3xl font-black">₹{dailyStats.cashSales}</h3>
          </div>

          {/* Online బాక్స్ */}
          <div className="bg-blue-500 p-8 rounded-[2rem] text-white">
            <p className="text-[10px] uppercase opacity-80">Online Sales</p>
            <h3 className="text-3xl font-black">₹{dailyStats.onlineSales}</h3>
          </div>

          {/* Orders బాక్స్ */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] uppercase text-slate-400">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900">{dailyStats.count}</h3>
          </div>
  </div>

        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4 text-emerald-700">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <p className="text-[10px] font-black uppercase italic">Protocol: Data auto-purged every 15 days for speed optimization.</p>
        </div>
      </div>
    ) : (
      <UpgradeBanner />
    )
  )}
  {/* PAGE 4: OWNER PROFILE DETAILS */}
  {activeTab === "profile" && (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <h2 className="text-4xl font-black italic uppercase text-slate-900">
        Owner<br/><span className="text-purple-600">Profile Matrix</span>
      </h2>

  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden w-full">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shrink-0 mx-auto sm:mx-0">
              <span className="text-xl">🛡️</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tight italic">Sudara Trust & Verification</h4>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest">Active</span>
              </div>
              <p className="text-slate-400 text-[11px] md:text-xs mt-1 max-w-2xl font-medium leading-relaxed uppercase tracking-wider">
                Your establishment is officially verified within the Sudara Network. Download your official partner certificate to enhance merchant credibility and showcase community trust.
              </p>
            </div>
          </div>

          <button
            type="button"
  onClick={() => {
    try {
    
      
      // 1. ఓనర్ డేటా వేరియబుల్స్ (డైనమిక్)
      const name = owner?.name || "SUDARA PARTNER";
      const district = owner?.district || "LOCAL";
      const state = owner?.state || "ANDHRA PRADESH";
      
      const certificateId = `SUDARA-2026-${(owner?._id || "HUBSOT").toString().slice(-6).toUpperCase()}`;
      const issueDate = owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

      // 2. రాయల్ గోల్డ్ & బ్లూ మిక్స్డ్ ప్రొఫెషనల్ HTML డిజైన్
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;600;800&display=swap');
          
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; padding: 0; font-family: 'Montserrat', sans-serif; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; }
          
          /* మెయిన్ కంటైనర్ & రాయల్ బోర్డర్ */
          .container { width: 297mm; height: 210mm; padding: 14mm; box-sizing: border-box; position: relative; background: #ffffff; }
          .outer-border { width: 269mm; height: 182mm; border: 4px solid #1e3a8a; padding: 4mm; box-sizing: border-box; position: relative; }
          .inner-border { width: 100%; height: 100%; border: 2px solid #b45309; padding: 12mm; box-sizing: border-box; position: relative; text-align: center; background: #fafaf9; }
          
          /* కార్నర్ డెకరేషన్స్ */
          .corner { position: absolute; width: 16px; height: 16px; border: 4px solid #b45309; }
          .top-left { top: -4px; left: -4px; border-right: none; border-bottom: none; }
          .top-right { top: -4px; right: -4px; border-left: none; border-bottom: none; }
          .bottom-left { bottom: -4px; left: -4px; border-right: none; border-top: none; }
          .bottom-right { bottom: -4px; right: -4px; border-left: none; border-top: none; }
          
          /* బ్రాండింగ్ హెడర్ */
          .header .title { font-family: 'Cinzel', serif; font-size: 34pt; font-weight: 800; letter-spacing: 0.12em; color: #1e3a8a; text-transform: uppercase; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
          .header .subtitle { font-family: 'Montserrat', sans-serif; font-size: 8.5pt; font-weight: 800; letter-spacing: 0.45em; color: #b45309; text-transform: uppercase; margin: 3mm 0 0 0; }
          
          .cert-label { font-family: 'Montserrat', sans-serif; font-size: 11pt; font-weight: 800; letter-spacing: 0.3em; color: #64748b; text-transform: uppercase; margin-top: 8mm; }
          .present { font-size: 12pt; font-style: italic; color: #475569; margin-top: 3mm; font-family: 'Georgia', serif; }
          
          /* ప్రొఫెషనల్ హబ్ నేమ్ */
          .hub-name { font-family: 'Cinzel', serif; font-size: 26pt; font-weight: 800; color: #1e1b4b; margin: 4mm auto; border-bottom: 2px dashed #cbd5e1; display: inline-block; padding-bottom: 2mm; min-width: 170mm; }
          
          .location { font-family: 'Montserrat', sans-serif; font-size: 9.5pt; font-weight: 700; color: #475569; text-transform: uppercase; tracking: 0.05em; margin-top: 1mm; }
          .location span { color: #1e3a8a; font-weight: 800; }
          
          /* లీగల్ టెక్స్ట్ */
          .desc { font-family: 'Montserrat', sans-serif; font-size: 10.5pt; line-height: 1.6; color: #334155; max-width: 215mm; margin: 6mm auto 0 auto; text-align: center; font-weight: 500; }
          
          /* ఫుటర్ ఏరియా */
          .footer { position: absolute; bottom: 12mm; width: 90%; left: 5%; }
          .meta { float: left; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 8.5pt; color: #475569; line-height: 1.6; font-weight: 600; }
          .meta strong { color: #0f172a; }
          
          .badge { display: inline-block; text-align: center; margin-top: -4mm; }
          .badge-icon { font-size: 32pt; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.1)); }
          .badge-text { font-family: 'Montserrat', sans-serif; font-size: 7.5pt; font-weight: 800; color: #1e3a8a; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1mm; }
          
          .sig-block { float: right; text-align: right; }
          .sig-stamp { font-family: 'Courier New', monospace; font-size: 13pt; font-weight: 900; color: #16a34a; margin-bottom: 1mm; font-style: italic; letter-spacing: -0.5px; background: rgba(22, 163, 74, 0.08); padding: 2px 8px; border: 1.5px dashed #16a34a; border-radius: 4px; display: inline-block; transform: rotate(-2deg); }
          .sig-line { width: 52mm; border-top: 1.5px solid #475569; margin: 3mm 0 2mm auto; }
          .sig-text { font-family: 'Montserrat', sans-serif; font-size: 8pt; color: #475569; line-height: 1.4; font-weight: 600; }
          .sig-text strong { color: #0f172a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="outer-border">
            <div class="inner-border">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>

              <div class="header">
                <div class="title">Sudara Hub</div>
                <div class="subtitle">Hyperlocal Discovery Network</div>
              </div>
              
              <div class="cert-label">Certificate of Excellence</div>
              <div class="present">This establishment is officially recognized and verified as an elite partner</div>
              
              <div class="hub-name">${name}</div>
              <div class="location">Region: <span>${district} District, ${state}</span></div>
              
              <div class="desc">
                This verification certifies that the aforementioned establishment has successfully integrated into the Sudara Network ecosystem. It has demonstrated unwavering compliance with premium quality benchmarks, live matrix synchronization protocols, real-time catalog accuracy, and local neighborhood dining service excellence.
              </div>
              
              <div class="footer">
                <div class="meta">
                  <div style="width: 48mm; border-top: 1.5px solid #64748b; margin-bottom: 2.5mm;"></div>
                  <strong>Certificate ID:</strong> ${certificateId}<br>
                  <strong>Issue Date:</strong> ${issueDate}<br>
                  <strong>Status:</strong> Active & Verified
                </div>
                
                <div class="badge">
                  <div class="badge-icon">🛡️</div>
                  <div class="badge-text">Verified Partner</div>
                </div>
                
                <div class="sig-block">
                  <div class="sig-stamp">✓ OVT_Verified</div>
                  <div class="sig-line"></div>
                  <div class="sig-text">
                    <strong>Owner Verifying Team (OVT)</strong><br>
                    Sudara Trust & Safety Compliance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      // 3. ఐఫ్రేమ్ మెకానిజం ద్వారా పక్కాగా ప్రింట్ చేయడం
      const oldFrame = document.getElementById('sudara-cert-iframe');
      if (oldFrame) oldFrame.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'sudara-cert-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '1px'; 
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow.document || iframe.contentDocument;
      iframeDoc.open();
      iframeDoc.write(htmlContent); 
      iframeDoc.close();

      const checkAndPrint = () => {
        const isContentReady = iframeDoc.body && iframeDoc.body.innerHTML.trim().length > 0;
        if (isContentReady) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } else {
          setTimeout(checkAndPrint, 50);
        }
      };

      checkAndPrint();

    } catch (err) {
      console.error(err);
      alert("Something went wrong with local generation, Raju!");
    }
  }}
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] active:scale-95 transition-all duration-300 shrink-0 flex items-center justify-center gap-2"
          >
            <span>Download Certificate</span>
            <span className="text-xs">⬇️</span>
          </button>
        </div>
      </div>
  {/* Profile పేజీలో ఈ సెక్షన్ యాడ్ చేయి */}
<div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl mt-8">
  <h3 className="text-xl font-black uppercase italic mb-6">Digital Hub QR</h3>
  <div className="flex flex-col items-center gap-6">
    <div className="p-4 bg-white rounded-[2rem] shadow-lg border">
       <QRCodeCanvas id="qr-gen" value={`https://sudara.in/restaurant/${owner?._id}`} size={200} level="H" />
    </div>
    <button 
      onClick={downloadQRCode} 
      className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest flex items-center gap-3 active:scale-95 transition-all"
    >
      <Download className="w-4 h-4" /> Download QR Poster
    </button>
  </div>
</div>
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl"></div>

        {/* Profile Image & Name */}
        <div className="flex flex-col items-center gap-4 border-b pb-6">
          <img 
            src={owner?.hotelImage || "https://via.placeholder.com/150"} 
            className="w-24 h-24 rounded-[2rem] object-cover border-4 border-purple-50 shadow-lg" 
            alt="Owner"
          />
          <div className="text-center">
            <h3 className="text-2xl font-black uppercase italic text-slate-900">{owner?.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Owner</p>
          </div>
        </div>

        {/* Credential Fields */}
        <div className="space-y-4">
          {/* Email Field */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registered Email</p>
            <p className="font-bold text-slate-700">{owner?.email}</p>
          </div>

          {/* Password Field - ఇక్కడ ఒక చిన్న ట్రిక్! */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Secret Access Key (Password)</p>
            <div className="flex justify-between items-center">
              <p className="font-bold text-slate-700 tracking-tighter">
                {/* పాస్‌వర్డ్ ని డైరెక్ట్ గా చూపించకుండా ఇలా పెడితే బాగుంటుంది రాజు */}
                ••••••••••••
              </p>
              <button 
                onClick={() => alert(`నీ పాస్‌వర్డ్: ${owner?.password}`)}
                className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-all"
              >
                See Password
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase">Category</p>
            <p className="text-xs font-black uppercase italic text-slate-700">{owner?.category || 'General'}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[8px] font-black text-slate-400 uppercase">Status</p>
            <p className="text-xs font-black uppercase italic text-emerald-600">Active Node</p>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 flex items-center gap-4 text-purple-700">
        <ShieldCheck className="w-6 h-6 shrink-0" />
        <p className="text-[10px] font-black uppercase italic">Protocol: Keep your credentials confidential. SUDARA never asks for passwords via call.</p>
      </div>
    </div>
  )}

        </main>

        {/* MODALS - NO FEATURES REMOVED, RESTAURANT IMAGE ADDED */}
        <AnimatePresence>
          
          {/* MOBILE MENU */}
          {isMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden" />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[110] shadow-2xl flex flex-col p-6 lg:hidden">
                <div className="flex justify-between items-center mb-10 border-b pb-4"><span className="font-black italic uppercase text-blue-600">Hub Menu</span><button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-6 h-6"/></button></div>
                <div className="flex flex-col gap-4">
                  <button onClick={() => { setActiveTab("dashboard"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50'}`}><UtensilsCrossed className="w-5 h-5" /> Menu Management</button>
                  <button onClick={() => { setActiveTab("live-orders"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'live-orders' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50'}`}><Bell className="w-5 h-5" /> Live Orders</button>
                  <button onClick={() => { setActiveTab("sales-report"); setIsMenuOpen(false); }} className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 ${activeTab === 'sales-report' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50'}`}><BarChart3 className="w-5 h-5" /> Sales Report</button>
                  <button 
    onClick={() => { setActiveTab("profile"); setIsMenuOpen(false); }} 
    className={`p-4 rounded-2xl font-bold uppercase italic text-xs flex items-center gap-4 transition-all ${activeTab === 'profile' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'bg-slate-50 text-slate-600'}`}
  >
    <Settings className="w-5 h-5" /> Login Details & Verified Certificate
  </button>
                  <hr className="my-4" />
                  <button onClick={() => { setIsMenuOpen(false); setIsShowingMatrix(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-600 font-bold uppercase italic text-xs"><BarChart3 className="w-5 h-5" /> Analytics Matrix</button>
                  <button onClick={() => { setIsMenuOpen(false); setIsRenewalModalOpen(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 text-orange-600 font-black uppercase italic text-xs border border-orange-200 shadow-sm"><QrCode className="w-5 h-5" /> Renew Node</button>
                  <button onClick={() => { setIsMenuOpen(false); setIsEditingProfile(true); }} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-800 font-bold uppercase italic text-xs border border-slate-100"><Settings className="w-5 h-5" /> Hub Settings</button>
                  <button onClick={() => { localStorage.removeItem("owner"); navigate("/owner"); }} className="mt-10 p-4 rounded-2xl bg-red-50 text-red-500 font-bold uppercase italic text-xs"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
              </motion.div>
            </>
          )}
  {/* SETTINGS MODAL - FULL MATRIX CONFIGURATION */}
  {isEditingProfile && (
    <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden">
        
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black italic uppercase text-slate-900">Hub Configuration</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Profile Matrix</p>
          </div>
          <button onClick={() => setIsEditingProfile(false)} className="p-2 bg-slate-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={async (e) => { 
            e.preventDefault(); 
            setSending(true); 
            try { 
              const res = await api.put(`/owner/update-profile/${owner._id}`, profileForm); 
              setOwner(res.data); 
              localStorage.setItem("owner", JSON.stringify(res.data)); 
              setIsEditingProfile(false); 
              alert("Matrix Synchronized! ✅"); 
            } catch(e){ alert("Transmission Error"); } 
            finally { setSending(false); }
          }} 
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide"
        >

          {/* 🖼️ INTERIOR & BANNER IMAGES SECTION */}
  <div className="space-y-4">
    <label className="text-[10px] font-black uppercase text-slate-400 italic">Visual Assets (Banner & Interior)</label>
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      
      {/* Main Banner Image */}
      <div className="relative flex-shrink-0">
        <img src={profileForm.hotelImage || "https://via.placeholder.com/150"} className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500" />
        <label className="absolute -top-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg">
          <Camera className="w-3 h-3" />
          <input type="file" accept="image/*" className="hidden" onChange={handleProfileImage} />
        </label>
        <p className="text-[8px] text-center mt-1 font-bold uppercase">Main Banner</p>
      </div>

      {/* Interior Images Display */}
      {profileForm.interiorImages?.map((img, idx) => (
        <div key={idx} className="relative flex-shrink-0">
          <img src={img} className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100" />
          <button 
            type="button" 
            onClick={() => {
              // ❌ ఇమేజ్ ని లిస్ట్ నుండి డిలీట్ చేసే రాజు లాజిక్
              const newImgs = profileForm.interiorImages.filter((_, i) => i !== idx);
              setProfileForm({...profileForm, interiorImages: newImgs});
            }} 
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full active:scale-90 transition-all shadow-md"
          >
            <X className="w-3 h-3"/>
          </button>
        </div>
      ))}
      
      {/* Add More Interior Button */}
      <label className="w-24 h-24 flex-shrink-0 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all active:scale-95 shadow-inner">
        <Plus className="w-6 h-6 text-slate-400" />
        <span className="text-[7px] font-black uppercase mt-1">Add Interior</span>
        <input 
          type="file" 
          multiple 
          accept="image/*" // 💡 కేవలం ఇమేజ్ ఫైల్స్ మాత్రమే ఓపెన్ అవ్వడానికి రాజు!
          className="hidden" 
          onChange={handleInteriorUploads} // 🎯 ఇప్పుడు ఈ ఫంక్షన్ పక్కాగా రన్ అవుతుంది రాజు!
        />
      </label>
    </div>
  </div>

          {/* ⚡ STATUS & QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem]">
            {/* ఓనర్ డ్యాష్‌బోర్డ్ లోని Settings Modal లో ఈ కోడ్ యాడ్ చెయ్ */}
<div className="space-y-2">
  <label className="text-[9px] font-black uppercase text-slate-400">Hub Occupancy (Rush Level)</label>
  <select 
    value={profileForm.busyStatus} 
    onChange={e => setProfileForm({...profileForm, busyStatus: e.target.value})} 
    className="w-full bg-white p-4 rounded-2xl text-xs font-bold border outline-none focus:border-blue-500 transition-all"
  >
    {['Low', 'Medium', 'High', 'Busy'].map(s => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
</div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400">Total Tables</label>
              <input type="number" value={profileForm.tableCount} onChange={e=>setProfileForm({...profileForm, tableCount: e.target.value})} className="w-full bg-white p-3 rounded-xl text-xs font-bold border outline-none" />
            </div>
          </div>

          {/* 📢 TODAY'S SPECIAL MESSAGE */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-blue-500 italic">🔥 Today's Special Broadcast</label>
            <input type="text" placeholder="E.g., Fresh Dum Biryani available now!" value={profileForm.todaySpecial} onChange={e=>setProfileForm({...profileForm, todaySpecial:e.target.value})} className="w-full bg-blue-50 p-4 rounded-2xl font-bold text-xs border border-blue-100 outline-none focus:bg-white" />
          </div>

          {/* 🏦 FINANCIAL NODE (UPI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400">UPI ID</label>
              <input type="text" placeholder="owner@okicici" value={profileForm.upiID} onChange={e=>setProfileForm({...profileForm, upiID:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none" />
            </div> */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400">PhonePe/GPay Number</label>
              <input type="text" placeholder="9876543210" value={profileForm.upiNumber} onChange={e=>setProfileForm({...profileForm, upiNumber:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border outline-none" />
            </div>
          </div>
  {/* 🧾 DYNAMIC TAX & ADDITIONAL CHARGES PROTOCOL (100% RESPONSIVE) */}
  <div className="mt-4 p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem]">
    
    {/* సెక్షన్ హెడ్డింగ్ */}
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 italic text-center sm:text-left">
      POS Billing Config Protocol
    </p>

    {/* గ్రిడ్ లేఅవుట్: మొబైల్ లో సింగిల్ కాలమ్ (grid-cols-1), పెద్ద స్క్రీన్స్ లో టూ కాలమ్స్ (sm:grid-cols-2) రాజు! */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      {/* 🎯 GST Input Box - ఓనర్ తన ఇష్టం వచ్చిన పర్సంటేజ్ టైప్ చేసుకోవచ్చు రాజు */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wide">
          Restaurant GST Percentage (%)
        </label>
        <div className="relative flex items-center">
          <input 
            type="number" 
            step="0.1" /* పాయింట్లలో టాక్స్ ఉన్నా కూడా ఒప్పుకుంటుంది రాజు */
            min="0"
            max="100"
            placeholder="e.g. 5 or 18"
            value={profileForm.gstPercentage ?? ""} 
            onChange={e => {
              const val = e.target.value === "" ? 0 : Number(e.target.value);
              setProfileForm({...profileForm, gstPercentage: val});
            }} 
            className="w-full bg-white p-3.5 pr-10 rounded-2xl text-xs font-bold border border-slate-200 outline-none focus:border-blue-500 text-slate-800 shadow-sm transition-all uppercase" 
          />
          {/* పక్కన సింబల్ లగ్జరీ లుక్ కోసం */}
          <span className="absolute right-4 text-xs font-black text-slate-400 pointer-events-none">%</span>
        </div>
      </div>
      
      {/* 🎯 Extra Charges Input Box */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wide">
          Extra Charges (₹ Packing / Service)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-xs font-black text-slate-400 pointer-events-none">₹</span>
          <input 
            type="number" 
            min="0"
            placeholder="e.g. 20 or 40"
            value={profileForm.extraCharges ?? ""} 
            onChange={e => {
              const val = e.target.value === "" ? 0 : Number(e.target.value);
              setProfileForm({...profileForm, extraCharges: val});
            }} 
            className="w-full bg-white p-3.5 pl-8 rounded-2xl text-xs font-bold border border-slate-200 outline-none focus:border-blue-500 text-slate-800 shadow-sm transition-all uppercase" 
          />
        </div>
      </div>

    </div>

    {/* ఓనర్ కి అర్థం అవ్వడానికి కింద ఒక చిన్న హెల్పర్ నోట్ రాజు */}
    <p className="text-[8px] font-medium text-slate-400 text-center sm:text-left mt-3 uppercase tracking-wide">
      * Note: Bills will be auto-calculated using inclusive method based on these values.
    </p>
  </div>
          {/* 📍 GEOLOCATION & ADDRESS */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={handleGetLocation} className="bg-blue-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"><MapPin className="w-4 h-4" /> Sync GPS</button>
            <div className="flex bg-slate-100 p-1 rounded-2xl border">
              {['Veg', 'Non-Veg', 'Both'].map(t => (
                <button key={t} type="button" onClick={() => setProfileForm({...profileForm, foodType:t})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${profileForm.foodType===t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{t}</button>
              ))}
            </div>
          </div>

          <textarea placeholder="Specific Building Address / Landmark" value={profileForm.address} onChange={e=>setProfileForm({...profileForm, address:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs border h-24 outline-none focus:bg-white" />
          
          <button disabled={sending} className="w-full bg-slate-900 py-6 text-white rounded-[2rem] font-black uppercase italic shadow-2xl tracking-[0.2em] active:scale-95 transition-all sticky bottom-0">
            {sending ? "Transmitting Matrix..." : "Commit Global Update"}
          </button>
        </form>
      </motion.div>
    </div>
  )}

          {/* ANALYTICS MATRIX MODAL (Original Detailed Logic) */}
  {/* ANALYTICS MATRIX MODAL (Original Detailed Logic) */}
          {isShowingMatrix && (
            <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-5xl p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                <button type="button" onClick={() => setIsShowingMatrix(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full active:scale-90"><X className="w-5 h-5"/></button>
                <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter mb-8 border-l-8 border-blue-600 pl-6">Hub Matrix</h3>
                
                {/* 🎯 రాజు మాస్టర్ Λాక్: ఒకవేళ ఓనర్ ప్రీమియం కాకపోతే (అంటే బేసిక్ ₹50 ప్లాన్ అయితే) మ్యాట్రిక్స్ డేటా మొత్తం హైడ్ అయిపోతుంది! */}
                {owner?.planType !== "premium" ? (
                  <div className="py-4 text-center">
                    <UpgradeBanner />
                  </div>
                ) : (
                  /* 👑 ఓనర్ ప్రీమియం అయితేనే ఈ కింద ఉన్న అనలిటిక్స్ మ్యాట్రిక్స్ అంతా ఓపెన్ అవుతుంది రాజు! */
                  <>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-6">
                      <button type="button" onClick={() => setViewMode("daily")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "daily" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Today</button>
                      <button type="button" onClick={() => setViewMode("range")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "range" ? "bg-white text-blue-600 shadow-lg" : "text-slate-400"}`}>Range</button>
                    </div>
                    
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewMode === "daily" ? (
                        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                      ) : (
                        <>
                          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="bg-slate-50 p-4 rounded-2xl font-bold text-xs border" />
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {(() => {
                        let stats = viewMode === "daily" ? {
                          hits: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.kitchen_entry || 0,
                          preOrders: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.pre_order_click || 0,
                          postOrders: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.post_order_click || 0,
                          calls: owner?.analytics?.[`${new Date(filterDate).getDate()}/${new Date(filterDate).getMonth()+1}/${new Date(filterDate).getFullYear()}`]?.call_click || 0,
                        } : getOwnerRangeStats();
                        
                        return [
                          { label: "Menu Hits", val: stats.hits, icon: Compass, color: "text-slate-500", bg: "bg-slate-100" },
                          { label: "Pre-Orders", val: stats.preOrders, icon: UtensilsCrossed, color: "text-blue-600", bg: "bg-blue-100" },
                          { label: "Post-Booking", val: stats.postOrders, icon: Bell, color: "text-orange-600", bg: "bg-orange-100" },
                          { label: "Calls Made", val: stats.calls, icon: PhoneCall, color: "text-emerald-600", bg: "bg-emerald-100" },
                        ].map((s, idx) => (
                          <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 text-center hover:shadow-xl transition-all group">
                            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}><s.icon className="w-7 h-7"/></div>
                            <p className="text-[10px] font-black uppercase opacity-40 mb-2">{s.label}</p>
                            <p className="text-5xl font-black italic text-slate-900 tracking-tighter">{s.val}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                )}
                
              </motion.div>
            </div>
          )}

          {/* ADD/EDIT DISH MODAL (Original Logic) */}
          {(isAddingItem || isEditingItem) && (
            <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={() => { setIsAddingItem(false); setIsEditingItem(false); }} className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full active:scale-90"><X className="w-5 h-5"/></button>
                <h3 className="text-xl font-black italic uppercase mb-8">{isEditingItem ? "Modify dish" : "Add to Kitchen"}</h3>
                <form onSubmit={handleSubmitItem} className="space-y-4">
                  <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                    {form.image ? (
    <img 
      src={form.image instanceof File ? URL.createObjectURL(form.image) : form.image} 
      className="w-20 h-20 rounded-2xl object-cover shadow-lg" 
      onLoad={(e) => {
        // ఒక్కసారి ఫోటో లోడ్ అవ్వగానే ఆ టెంపరరీ URLని రిలీజ్ చెయ్ (మెమరీ కోసం)
        if (form.image instanceof File) URL.revokeObjectURL(e.target.src);
      }}
      alt="Dish Preview"
    />
  ) : (
    <ImageIcon className="text-slate-200 w-10 h-10"/>
  )}
                    <label className="text-[10px] font-black bg-white border border-slate-200 px-5 py-2.5 rounded-xl cursor-pointer hover:bg-blue-600 hover:text-white transition-all">Upload Photo<input type="file" className="hidden" onChange={handleItemImage} accept="image/*" /></label>
                  </div>
                  <input type="text" placeholder="Dish Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border outline-none" required />
                  <input type="number" placeholder="Price (₹)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border outline-none" required />
                  {/* పాత కోడ్ ప్లేస్ లో దీన్ని పెట్టు */}
<div className="flex bg-slate-100 p-1 rounded-xl">
  {["Veg", "Non-Veg", "General"].map(c => (
    <button 
      key={c} 
      type="button" 
      onClick={() => setForm({...form, category: c})} 
      className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all 
        ${form.category === c 
          ? (c === 'Veg' ? 'bg-emerald-500 text-white' : 
             c === 'Non-Veg' ? 'bg-red-500 text-white' : 
             'bg-slate-700 text-white') 
          : 'text-slate-400 bg-transparent'}`}
    >
      {c}
    </button>
  ))}
</div>
                  {/* కేటగిరీ సెలెక్ట్ డ్రాప్‌డౌన్ మార్పు */}
<select 
  required 
  value={form.subCategory} 
  onChange={e => { 
    const val = e.target.value;
    setForm({...form, subCategory: val});
    setIsOtherSub(val === "Others"); 
  }} 
  className="w-full bg-slate-50 p-4 rounded-2xl font-bold border text-xs outline-none"
>
  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
  <option value="Others">+ Create New Category</option>
</select>

{/* కొత్త కేటగిరీ పేరు ఎంటర్ చేయడానికి */}
{isOtherSub && (
  <input 
    type="text" 
    placeholder="Enter New Category Name" 
    value={customSub} 
    onChange={e => setCustomSub(e.target.value)} 
    className="w-full bg-blue-50 border-blue-200 p-4 rounded-2xl font-bold text-xs" 
    required 
  />
)}
                  <button disabled={sending} className="w-full bg-slate-900 py-5 text-white rounded-2xl font-black uppercase italic tracking-widest mt-4 shadow-xl active:scale-95 transition-all">{sending ? 'Publishing...' : 'Publish Item'}</button>
                </form>
              </motion.div>
            </div>
          )}
  {/* 👑 రాజు సపరేట్ సబ్‌స్క్రిప్షన్ రెనెవల్ మోడల్ (Subscription Renewal Modal) */}
  {isRenewalModalOpen && (
    <div className="fixed inset-0 z-[250] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-4xl p-6 md:p-10 rounded-[3rem] shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {/* క్లోజ్ బటన్ */}
        <button type="button" onClick={() => setIsRenewalModalOpen(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full active:scale-90 hover:bg-red-50 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
        
        <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter mb-2 border-l-8 border-orange-500 pl-6">
          Sudara Node <span className="text-orange-600">Subscription Renewal</span>
        </h3>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-8 pl-8">Plan B Protocol: Direct Peer-to-Peer Settlement</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* 👉 ఎడమ పక్క: ప్లాన్ కాన్ఫిగరేషన్ & యూపీఐ ఐడీ కాపీ ఏరియా (మొదటి స్టెప్స్) */}
          <div className="space-y-6">
            <p className="text-xs font-black uppercase text-slate-500">1. ప్లాన్ సెలెక్షన్ & యూపీఐ కాపీ</p>
            
            {/* ప్లాన్ టైప్ స్విచ్ */}
            <div className="flex bg-slate-100 p-1 rounded-xl border shadow-inner">
              <button type="button" onClick={() => setSelectedPlanType("basic")} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPlanType === "basic" ? "bg-slate-900 text-white shadow-md" : "text-slate-500"}`}>Basic (₹500/Month)</button>
              <button type="button" onClick={() => setSelectedPlanType("premium")} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${selectedPlanType === "premium" ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}>Premium (₹1499/Month)</button>
            </div>

            {/* రోజుల స్విచ్ */}
            <div className="flex bg-slate-100 p-1 rounded-xl border shadow-inner">
              <button type="button" onClick={() => setPlanDuration(30)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${planDuration === 30 ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-400"}`}>30 Days (1 Month)</button>
              <button type="button" onClick={() => setPlanDuration(90)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${planDuration === 90 ? "bg-white text-slate-900 shadow-sm font-black" : "text-slate-400"}`}>90 Days (3 Months)</button>
            </div>

            {/* 🎯 రాజు ఫిక్స్: ఫస్ట్ ఐడీ కాపీ ఆప్షన్ ఇక్కడికి తీసుకొచ్చాను! */}
            <div className="bg-slate-50 p-4 rounded-xl border flex justify-between items-center shadow-sm">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Official UPI ID</p>
                <p className="font-black text-slate-700 text-xs mt-1.5 tracking-wide">{SUDARA_UPI_ID}</p>
              </div>
              <button type="button" onClick={copyUpiIdToClipboard} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-90 transition-all text-[9px] font-black uppercase px-4 py-1.5 shadow-sm">
                {isCopied ? "Copied! ✅" : "Copy UPI ID"}
              </button>
            </div>

            {/* టోటల్ అమౌంట్ ప్రొఫెషనల్ డిస్‌ప్లే & పే నౌ బటన్ */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-xl relative overflow-hidden">
              <div>
                <p className="text-[8px] font-black uppercase opacity-50 tracking-widest leading-none">Total Payable Amount</p>
                <p className="text-3xl font-black italic tracking-tighter text-emerald-400 mt-2">₹{calculatedAmount}</p>
              </div>
              
              {/* PAY NOW ఫోన్‌పే డీప్ లింక్ బటన్ */}
              <a 
                href={`upi://pay?pa=${SUDARA_UPI_ID}&pn=Sudara%20Hub&am=${calculatedAmount}&cu=INR`}
                className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-lg text-white transition-all active:scale-95"
              >
                Pay Now
              </a>
            </div>
          </div>

          {/* 👉 కుడి పక్క: స్క్రీన్‌షాట్ అప్‌లోడ్ బాక్స్ & వెరిఫికేషన్ సబ్మిషన్ (చివరి స్టెప్స్) */}
          <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border">
            <p className="text-xs font-black uppercase text-slate-500">2. రసీదు సమర్పణ (Payment Verification)</p>
            
            {/* స్క్రీన్‌షాట్ అప్‌లోడర్ */}
            <div className="border-2 border-dashed border-slate-300 bg-white p-6 rounded-2xl text-center relative hover:bg-slate-50 transition-all">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                const file = e.target.files[0];
                if (file) optimizeImage(file, (base64) => setUploadedReceipt(base64));
              }} />
              {uploadedReceipt ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase">Screenshot Attached ✅</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase">Upload Payment Screenshot</span>
                </div>
              )}
            </div>

            {/* I HAVE PAID ఫైనల్ యాక్షన్ బటన్ */}
            <button 
              type="button" 
              onClick={() => { handleCommitRenewal(); setIsRenewalModalOpen(false); }}
              disabled={sending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-[10px] font-black uppercase italic tracking-[0.15em] shadow-lg transition-all"
            >
              {sending ? "Transmitting Receipt..." : "I Have Paid"}
            </button>
          </div>
          
        </div>

      </motion.div>
    </div>
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
        <footer className="mt-auto border-t border-slate-200 bg-white p-8"><Footer /></footer>
      </div>
    );
  }
  // 👑 రాజు ప్రీమియం ప్రమోషన్ యుఐ బ్యానర్
  function UpgradeBanner() {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] border border-purple-100 text-center shadow-2xl mt-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl"></div>
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 border border-purple-100 shadow-md">👑</div>
        <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">Upgrade to Advanced Pro Node</h3>
        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-2">Unlock the full power of Sudara Hub</p>
        <p className="text-xs font-medium text-slate-500 mt-4 leading-relaxed uppercase tracking-wide">
          Your account is currently on the Basic Plan (₹50/Day). To unlock Live Real-time Orders, Table Dining Configurations, Automatic Invoice Printing, and graphical Sales Matrix Reports, upgrade to Premium Plan for just ₹100/day.
        </p>
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 justify-center">
          <a href="tel:7569896128" className="bg-slate-950 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-lg active:scale-95 transition-all">Contact Account Manager</a>
        </div>
      </div>
    );
  }