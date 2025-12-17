import { useContext, useState, useEffect, useRef } from "react";
import ApiContext from "./context/ApiContext";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, Download, Trash2 } from "lucide-react";
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
    const newItem = await addManual(id, listId);
    if (!newItem) return;
    setList((prev) => ({ ...prev, lists: [...prev.lists, newItem] }));
    console.log("added manual item");
  };

  // pdf export replaces document.getElementById
  const invoiceRef = useRef(null);

const handleDownloadPDF = async () => {
  if (!invoiceRef.current) return;
  try {
    // Clone the DOM
    const clone = invoiceRef.current.cloneNode(true);
    clone.classList.add("pdf-safe-clone");

    // Force white background and text color
    clone.style.backgroundColor = "#ffffff"; // white background
    clone.querySelectorAll("*").forEach(el => {
      const styles = getComputedStyle(el);
      el.style.color = "#000000"; // black text for PDF readability
      el.style.backgroundColor = "#ffffff"; // override backgrounds
      el.style.borderColor = "#000000"; // borders in black
    });

    // Append to DOM (offscreen)
    document.body.appendChild(clone);

    // Render to canvas
    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // Generate PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ShoppingList-${listId}.pdf`);

    // Clean up
    document.body.removeChild(clone);
  } catch (e) {
    console.error("Error generating PDF:", e);
  }
};


  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
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
    <>
      {list.lists.length === 0 ? (
        <p className="text-gray-400 px-6 py-4">
          No items in this shopping list.
        </p>
      ) : (
        <div className="fixed inset-0 z-50 righteous-regular bg-black/70 flex justify-center items-start overflow-auto">
          <div className="w-full min-h-screen bg-gray-900 text-white relative flex flex-col items-center py-10">
            {/* Close button */}
            <div className="w-full max-w-5xl flex items-center justify-end px-6">
              <hr className="border-t-2 border-purple-600 my-6 w-full" />
              <Link to="/" className="text-2xl hover:text-red-500">
                ✖
              </Link>
            </div>

            {/* Action buttons */}
            <div className="w-full max-w-5xl flex justify-end gap-4 flex-wrap px-6 mt-6">
              <button
                onClick={handlePrint}
                disabled={!list}
                className="flex items-center justify-center gap-2 border-gray-400 border-2 px-4 py-2 rounded transition duration-300 ease-in hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-s font-bold text-gray-400">Print</span>
                <Printer className="cursor-pointer text-purple-500 transition duration-300 ease-in hover:scale-110" />
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!list}
                className="px-4 py-2 rounded border-gray-400 border-2 hover:transition duration-300 ease-in hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="cursor-pointer text-purple-500 transition duration-300 ease-in hover:scale-110" />
              </button>
              <button
                onClick={handleDeleteList}
                className="border-red-600 border-2 px-4 py-2 rounded hover:text-white transition duration-300 ease-in hover:scale-110"
              >
                <Trash2 className="cursor-pointer text-red-500 hover:text-white transition duration-300 ease-in hover:scale-110" />
              </button>
            </div>

            {/* Shopping list content */}
            <div ref={invoiceRef} className="w-full max-w-5xl pdf-safe mt-6">
              <h1 className="text-3xl font-bold px-6 text-start">
                Shopping List
              </h1>

              <div className="mt-4 px-6">
                <table className="w-full table-auto border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-center">Unit</th>
                      <th className="px-4 py-2 text-center">Purchased</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.lists.map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="bg-[#1b1b1b] text-white"
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.itemName}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(index, -1)}
                              className="bg-gray-700 w-6 h-6 rounded-full text-white"
                            >
                              -
                            </button>
                            {item.quantity}
                            <button
                              onClick={() => handleQuantityChange(index, 1)}
                              className="bg-gray-700 w-6 h-6 rounded-full text-white"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.unit || "N/A"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={item.purchased}
                            onChange={() => handlePurchase(index)}
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() =>
                              handleRemoveIngredient(item.itemName)
                            }
                            className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded-lg"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Manual add item */}
              <div className="mt-6 px-6 flex gap-2">
                <input
                  value={manualItem}
                  onChange={(e) => setManualItem(e.target.value)}
                  placeholder="Add item…"
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
                />
                <button
                  onClick={handleAddManual}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
