import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const Notification = ({ type = "info", message, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`fixed top-20 right-4 max-w-md p-4 rounded-lg border ${bgColors[type]} shadow-lg z-50 animate-slide-in`}
    >
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
