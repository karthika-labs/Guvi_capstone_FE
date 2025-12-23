import { useContext, useState, useEffect, useRef } from "react";
import ApiContext from "./context/ApiContext";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ShoppingListPage() {
  const {
    shoppingList,
    fetchShoppingList,
    updateShoppingList,
    removeIngredient,
    deleteShoppingList,
    manualItem,
    setManualItem,
    addManual,
    setShoppingList,
  } = useContext(ApiContext);

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualUnit, setManualUnit] = useState(""); // Add unit input state
  const { id, listId } = useParams();

  useEffect(() => {
    const loadList = async () => {
      try {
        const data = await fetchShoppingList(id, listId);
        setList(data);
      } catch (err) {
        console.error("Error fetching shopping list:", err);
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [id, listId]);

  // const handleQuantityChange = async (index, delta) => {
  //   // deep copy
  //   const prev = JSON.parse(JSON.stringify(list));
  //   const updated = JSON.parse(JSON.stringify(list));

  //   updated.lists[index].quantity =
  //     Math.max(1, updated.lists[index].quantity + delta);

  //   setList(updated);

  //   try {
  //     await updateShoppingList(id, listId, { lists: updated.lists });
  //   } catch (err) {
  //     console.error("Error updating quantity:", err);
  //     setList(prev); // rollback
  //   }
  // };
  const handleQuantityChange = async (index, delta) => {
    console.log("enters");
    const newList = { ...list };
    newList.lists[index].quantity = Math.max(
      1,
      newList.lists[index].quantity + delta
    );
    setList(newList);
    try {
      await updateShoppingList(id, listId, { lists: newList.lists });
      console.log("comes");
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleRemoveIngredient = async (itemName) => {
    try {
      const res = await removeIngredient(id, listId, itemName);
      setList(res.removed);
      console.log("removed", res.removed);
    } catch (err) {
      console.error("Error removing ingredient:", err);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm("Are you sure you want to delete this shopping list?"))
      return;
    try {
      await deleteShoppingList(id, listId);
      setList(null);
    } catch (err) {
      console.error("Error deleting shopping list:", err);
    }
  };

  const handlePurchase = async (i) => {
    try {
      const updated = [...list.lists];
      updated[i].purchased = !updated[i].purchased;

      setList({ ...list, lists: updated });
      await updateShoppingList(id, listId, { lists: updated });
    } catch (err) {
      console.error("Error updating purchased state:", err);
    }
  };

  const handleAddManual = async () => {
    // Check for duplicates (both item name and unit)
    if (list && list.lists) {
      const itemName = manualItem.trim().toLowerCase();
      const unit = manualUnit.trim().toLowerCase();
      
      const isDuplicate = list.lists.some((item) => {
        const existingItemName = (item.itemName || "").trim().toLowerCase();
        const existingUnit = (item.unit || "").trim().toLowerCase();
        return existingItemName === itemName && existingUnit === unit;
      });

      if (isDuplicate) {
        toast.error("This item with the same unit is already in the list!");
        return;
      }
    }

    // Add unit to the manual item
    const newItem = await addManual(id, listId, manualUnit.trim());
    if (!newItem) return;
    setList((prev) => ({ ...prev, lists: [...prev.lists, newItem] }));
    setManualUnit(""); // Clear unit input after adding
    toast.success("Item added successfully!");
  };

  // pdf export replaces document.getElementById
  const invoiceRef = useRef(null);

const handleDownloadPDF = async () => {
  if (!invoiceRef.current || !list) return;
  try {
    // Create a simplified HTML structure for PDF (avoid parsing computed styles with oklab)
    const pdfContainer = document.createElement("div");
    pdfContainer.style.cssText = "position: absolute; left: -9999px; width: 800px; background: #ffffff; color: #000000; padding: 20px; font-family: Arial, sans-serif;";
    
    // Build simple HTML with title only (no stats)
    let html = `
      <div style="margin-bottom: 20px; background: #ffffff; color: #000000;">
        <h1 style="color: #000000; font-size: 28px; margin-bottom: 20px; background: #ffffff; font-weight: bold;">Shopping List</h1>
      </div>
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; color: #000000;">
        <thead>
          <tr style="background: #f5f5f5; color: #000000;">
            <th style="border: 1px solid #cccccc; padding: 10px; text-align: left; color: #000000; background: #f5f5f5;">#</th>
            <th style="border: 1px solid #cccccc; padding: 10px; text-align: left; color: #000000; background: #f5f5f5;">Item</th>
            <th style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #f5f5f5;">Quantity</th>
            <th style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #f5f5f5;">Unit</th>
            <th style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #f5f5f5;">Purchased</th>
          </tr>
        </thead>
        <tbody style="background: #ffffff; color: #000000;">
    `;
    
    list.lists.forEach((item, index) => {
      const checkbox = item.purchased ? "☑" : "☐";
      html += `
        <tr style="background: #ffffff; color: #000000; ${item.purchased ? 'opacity: 0.6;' : ''}">
          <td style="border: 1px solid #cccccc; padding: 10px; color: #000000; background: #ffffff;">${index + 1}</td>
          <td style="border: 1px solid #cccccc; padding: 10px; color: #000000; background: #ffffff; ${item.purchased ? 'text-decoration: line-through;' : ''}">${item.itemName}</td>
          <td style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #ffffff;">${item.quantity}</td>
          <td style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #ffffff;">${item.unit || "N/A"}</td>
          <td style="border: 1px solid #cccccc; padding: 10px; text-align: center; color: #000000; background: #ffffff; font-size: 18px;">${checkbox}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
    `;
    
    pdfContainer.innerHTML = html;
    document.body.appendChild(pdfContainer);

    // Render to canvas
    const canvas = await html2canvas(pdfContainer, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    
    const imgData = canvas.toDataURL("image/png");

    // Generate PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ShoppingList-${listId}.pdf`);

    // Clean up
    document.body.removeChild(pdfContainer);
    toast.success("PDF downloaded successfully!");
  } catch (e) {
    console.error("Error generating PDF:", e);
    toast.error("Failed to generate PDF. Please try again.");
  }
};


  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          background: white;
          color: black;
        }
        .pdf-title {
          display: block !important;
        }
        .print-checkbox {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid #000;
          text-align: center;
          line-height: 14px;
          font-size: 14px;
        }
        .print-checkbox.checked::before {
          content: "✓";
        }
      }
    `,
  });

  if (loading) return <p>Loading shopping list...</p>;
  if (!list) return <p>No shopping list available.</p>;

  // return (
  //   <div className="bg-[#111] p-4 rounded-xl shadow-md border border-gray-800 mt-4">
  //     <div className="flex justify-between items-center mb-4">
  //       <button
  //         onClick={() => handlePrint()}
  //         className="flex items-center justify-center gap-2 border-gray-400 border-2 px-4 py-2 rounded transition duration-300 ease-in hover:scale-105"
  //       >
  //         {" "}
  //         <span className="text-s font-bold  text-gray-400">Print</span>
  //         <Printer className="cursor-pointer text-purple-500 transition duration-300 ease-in hover:scale-110" />
  //       </button>
  //       <button
  //         onClick={() => handleDownloadPDF()}
  //         className=" px-4 py-2 rounded border-gray-400 border-2 hover:transition duration-300 ease-in hover:scale-105"
  //       >
  //         <Download className="cursor-pointer text-purple-500 transition duration-300 ease-in hover:scale-110" />
  //       </button>
  //       {/* <button
  //         onClick={handleDeleteList}
  //         className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg transition"
  //       >
  //         Delete List
  //       </button> */}
  //       <button
  //         onClick={handleDeleteList}
  //         className="border-red-600 border-2 px-4 py-2 rounded  hover:text-white transition duration-300 ease-in hover:scale-110"
  //       >
  //         <Trash2 className="cursor-pointer text-red-500 hover:text-white transition duration-300 ease-in hover:scale-110" />
  //       </button>
  //     </div>

  //     <div ref={invoiceRef} className="space-y-2 pdf-safe">
  //       <input
  //         className="text-white"
  //         value={manualItem}
  //         onChange={(e) => setManualItem(e.target.value)}
  //         placeholder="Add item…"
  //       />
  //       <button
  //         className="text-white"
  //         onClick={()=>handleAddManual()}
  //       >
  //         Add
  //       </button>

  //       <h2 className="text-white text-lg font-semibold text-color-invoice">
  //         Shopping List
  //       </h2>
  //       {list.lists.map((item, index) => (
  //         <div
  //           key={item._id || item.localId || `${item.itemName}-${index}`}
  //           className="flex justify-between items-center bg-[#1b1b1b] p-3 rounded-lg"
  //         >
  //           <div>
  //             <p className="text-white font-medium">{item.itemName}</p>
  //             <p className="text-gray-400 text-sm">
  //               {item.quantity} {item.unit || "not defined"}
  //             </p>
  //           </div>

  //           <div className="flex items-center gap-2">
  //             <button
  //               onClick={() => handleQuantityChange(index, -1)}
  //               className="bg-gray-700 text-white w-6 h-6 rounded-full"
  //             >
  //               -
  //             </button>
  //             <button
  //               onClick={() => handleQuantityChange(index, 1)}
  //               className="bg-gray-700 text-white w-6 h-6 rounded-full"
  //             >
  //               +
  //             </button>
  //             <input
  //               type="checkbox"
  //               checked={list.lists[index].purchased}
  //               onChange={() => handlePurchase(index)}
  //             />

  //             <button
  //               onClick={() => handleRemoveIngredient(item.itemName)}
  //               className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition"
  //             >
  //               ✕
  //             </button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // return (
  //   <div className="shopping-list-container">
  //     <div className="actions flex justify-between items-center mb-4">
  //       <button onClick={() => {
  //   if (!invoiceRef.current) return; // prevents errors
  //   handlePrint();
  // }} className="btn-print">
  //         <span>Print</span>
  //         <Printer className="icon text-white" />
  //       </button>
  //       <button onClick={handleDownloadPDF} className="btn-download">
  //         <Download className="icon text-white" />
  //       </button>
  //       <button onClick={handleDeleteList} className="btn-delete">
  //         <Trash2 className="icon text-white" />
  //       </button>
  //     </div>

  //     <div className="shopping-list pdf-safe">
  //       <div className="manual-add flex gap-2 mb-2">
  //         <input
  //           className="manual-input"
  //           value={manualItem}
  //           onChange={(e) => setManualItem(e.target.value)}
  //           placeholder="Add item…"
  //         />
  //         <button className="manual-btn" onClick={handleAddManual}>Add</button>
  //       </div>
  //     <div  ref={invoiceRef} className="shopping-list pdf-safe" >
  //       <h2 className="title">Shopping List</h2>

  //       {list.lists.map((item, index) => (
  //         <div key={item._id || item.localId || `${item.itemName}-${index}`} className="item-row">
  //           <div>
  //             <p className="item-name">{item.itemName}</p>
  //             <p className="item-qty">{item.quantity} {item.unit || "not defined"}</p>
  //           </div>
  //           <div className="item-actions flex gap-2">
  //             <button onClick={() => handleQuantityChange(index, -1)} className="qty-btn">-</button>
  //             <button onClick={() => handleQuantityChange(index, 1)} className="qty-btn">+</button>
  //             <input type="checkbox" checked={list.lists[index].purchased} onChange={() => handlePurchase(index)} />
  //             <button onClick={() => handleRemoveIngredient(item.itemName)} className="remove-btn">✕</button>
  //           </div>
  //         </div>
  //       ))}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#181818] to-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shopping List
              </h1>
              <p className="text-gray-400 mt-2">Manage your shopping items</p>
            </div>
            <Link
              to={`/planner/${id}`}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 flex-wrap mb-6">
          <button
            onClick={handlePrint}
            disabled={!list || list.lists.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a2e] hover:bg-[#24242e] border border-purple-900/40 hover:border-purple-500/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!list || list.lists.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1a2e] hover:bg-[#24242e] border border-purple-900/40 hover:border-purple-500/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Download PDF</span>
          </button>
          <button
            onClick={handleDeleteList}
            className="flex items-center gap-2 px-5 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 hover:border-red-600 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">Delete List</span>
          </button>
        </div>

        {/* Stats and Add Item Section - At Top */}
        {list.lists.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-2xl border border-purple-900/40 shadow-xl p-6 mb-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f0f1a] rounded-xl p-4 border border-purple-900/40">
                <p className="text-gray-400 text-sm mb-1">Total Items</p>
                <p className="text-3xl font-bold text-white">{list.lists.length}</p>
              </div>
              <div className="bg-[#0f0f1a] rounded-xl p-4 border border-green-900/40">
                <p className="text-gray-400 text-sm mb-1">Purchased</p>
                <p className="text-3xl font-bold text-green-400">
                  {list.lists.filter((item) => item.purchased).length}
                </p>
              </div>
              <div className="bg-[#0f0f1a] rounded-xl p-4 border border-purple-900/40">
                <p className="text-gray-400 text-sm mb-1">Remaining</p>
                <p className="text-3xl font-bold text-purple-400">
                  {list.lists.filter((item) => !item.purchased).length}
                </p>
              </div>
            </div>

            {/* Add Item Input */}
            <div className="flex gap-3">
              <input
                value={manualItem}
                onChange={(e) => setManualItem(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddManual();
                  }
                }}
                placeholder="Item name..."
                className="flex-1 px-4 py-3 rounded-lg bg-[#0f0f1a] text-white border border-purple-900/40 focus:border-purple-500/50 focus:outline-none transition"
              />
              <input
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddManual();
                  }
                }}
                placeholder="Unit (e.g., kg, g, ml)"
                className="w-40 px-4 py-3 rounded-lg bg-[#0f0f1a] text-white border border-purple-900/40 focus:border-purple-500/50 focus:outline-none transition"
              />
              <button
                onClick={handleAddManual}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </button>
            </div>
          </div>
        )}

        {/* Shopping list content */}
        <div ref={invoiceRef} className="bg-[#1a1a2e] rounded-2xl border border-purple-900/40 shadow-xl p-6 pdf-safe">
          {/* Title for Print/PDF - Hidden by default, shown in print */}
          <div className="pdf-title mb-6 print:block hidden">
            <h1 className="text-3xl font-bold text-white mb-4 print:text-black">Shopping List</h1>
          </div>

          {list.lists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400 text-lg">No items in this shopping list.</p>
              <p className="text-gray-500 text-sm mt-2">Add items manually or generate from your meal plan</p>
              
              {/* Add Item Input for Empty State */}
              <div className="mt-8 max-w-2xl mx-auto flex gap-3">
                <input
                  value={manualItem}
                  onChange={(e) => setManualItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddManual();
                    }
                  }}
                  placeholder="Item name..."
                  className="flex-1 px-4 py-3 rounded-lg bg-[#0f0f1a] text-white border border-purple-900/40 focus:border-purple-500/50 focus:outline-none transition"
                />
                <input
                  value={manualUnit}
                  onChange={(e) => setManualUnit(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddManual();
                    }
                  }}
                  placeholder="Unit (e.g., kg, g, ml)"
                  className="w-40 px-4 py-3 rounded-lg bg-[#0f0f1a] text-white border border-purple-900/40 focus:border-purple-500/50 focus:outline-none transition"
                />
                <button
                  onClick={handleAddManual}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Print Table - Only visible in print */}
              <div className="hidden print:block mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 px-4 py-2 text-left">#</th>
                      <th className="border border-gray-400 px-4 py-2 text-left">Item</th>
                      <th className="border border-gray-400 px-4 py-2 text-center">Quantity</th>
                      <th className="border border-gray-400 px-4 py-2 text-center">Unit</th>
                      <th className="border border-gray-400 px-4 py-2 text-center">Purchased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.lists.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className={`${item.purchased ? 'opacity-60' : ''}`}
                      >
                        <td className="border border-gray-400 px-4 py-2">{index + 1}</td>
                        <td className={`border border-gray-400 px-4 py-2 ${item.purchased ? 'line-through' : ''}`}>
                          {item.itemName}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center">
                          {item.unit || "N/A"}
                        </td>
                        <td className="border border-gray-400 px-4 py-2 text-center">
                          {item.purchased ? '☑' : '☐'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Regular List View - Hidden in print */}
              <div className="space-y-3 print:hidden">
                {list.lists.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`bg-[#0f0f1a] rounded-xl p-4 border transition-all duration-200 ${
                      item.purchased
                        ? "border-green-500/30 bg-green-900/10 opacity-60"
                        : "border-purple-900/40 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-lg ${item.purchased ? "line-through text-gray-500" : "text-white"}`}>
                            {item.itemName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {item.unit || "No unit specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-lg px-3 py-2 border border-purple-900/40 print:bg-transparent print:border-none print:px-0">
                          <button
                            onClick={() => handleQuantityChange(index, -1)}
                            className="w-8 h-8 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 font-bold transition disabled:opacity-50 print:hidden"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="text-white font-semibold min-w-[2rem] text-center print:text-black print:font-normal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(index, 1)}
                            className="w-8 h-8 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 font-bold transition print:hidden"
                          >
                            +
                          </button>
                        </div>

                        {/* Purchased checkbox */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => handlePurchase(index)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 print:hidden"></div>
                          {/* Print checkbox - only visible in print */}
                          <span className={`hidden print:inline-block w-5 h-5 border-2 border-black text-center leading-4 text-sm ${item.purchased ? 'bg-black text-white' : 'bg-white'}`}>
                            {item.purchased ? '✓' : ''}
                          </span>
                        </label>

                        {/* Remove button - hidden in print */}
                        <button
                          onClick={() => handleRemoveIngredient(item.itemName)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 hover:border-red-600 rounded-lg transition text-red-400 hover:text-red-300 print:hidden"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
