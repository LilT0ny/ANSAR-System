import { useEffect, useState } from "react";
import {
  Camera,
  Save,
  Building,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  Trash2,
  Stethoscope,
} from "lucide-react";
import useConfigStore from "../store/useConfigStore";
import { SectionHeader, PageHeader } from "../components/molecules";
import { gradients, iconColors } from "../constants/colors";
import { useToast } from "../components/atoms";
import { applyThemeColors } from "../lib/themeUtils";

const Settings = () => {
  const {
    clinicName,
    logoUrl,
    clinicImage,
    primaryColor,
    secondaryColor,
    doctorName,
    specialty,
    email,
    phone,
    address,
    services,
    schedule,
    doctorImage,
    updateConfig,
  } = useConfigStore();

  const [localConfig, setLocalConfig] = useState({
    clinicName,
    logoUrl,
    clinicImage,
    primaryColor,
    secondaryColor,
    doctorName,
    specialty,
    email,
    phone,
    address,
    doctorImage,
  });

  const [localServices, setLocalServices] = useState(services);
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const { showToast } = useToast();

  // Aplicar el tema cuando cambia el color
  useEffect(() => {
    applyThemeColors(localConfig.primaryColor);
  }, [localConfig.primaryColor]);

  const handleSave = () => {
    try {
      updateConfig({
        ...localConfig,
        services: localServices,
        schedule: localSchedule,
      });
      // Asegurarse de que el color se guarde y se aplique
      applyThemeColors(localConfig.primaryColor);
      showToast("Sus datos se han guardado correctamente.", "success");
    } catch {
      showToast("Ocurrió un error al guardar. Intentá de nuevo.", "error");
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig({ ...localConfig, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const addService = () => {
    const newId = Math.max(...localServices.map((s) => s.id), 0) + 1;
    setLocalServices([
      ...localServices,
      { id: newId, name: "", price: "$0", duration: "30 min", description: "" },
    ]);
  };

  const removeService = (id) => {
    setLocalServices(localServices.filter((s) => s.id !== id));
  };

  const updateService = (id, field, value) => {
    setLocalServices(
      localServices.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const toggleDay = (day) => {
    setLocalSchedule({
      ...localSchedule,
      [day]: { ...localSchedule[day], enabled: !localSchedule[day].enabled },
    });
  };

  const updateSchedule = (day, field, value) => {
    setLocalSchedule({
      ...localSchedule,
      [day]: { ...localSchedule[day], [field]: value },
    });
  };

  const dayLabels: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Personaliza tu clínica dental"
        action={
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Save size={18} /> Guardar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Clinic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Clínica"
              icon={Building}
              iconColor={iconColors.clinic}
              gradientFrom={gradients.clinic.split(" ")[0]}
              gradientTo={gradients.clinic.split(" ")[1]}
            />
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Nombre de la Clínica
                </label>
                <input
                  value={localConfig.clinicName}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      clinicName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Nombre de tu clínica"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Dirección
                </label>
                <input
                  value={localConfig.address}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, address: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Dirección completa"
                />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary transition-colors group">
                      {localConfig.logoUrl ? (
                        <img
                          src={localConfig.logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Building size={20} />
                        </div>
                      )}
                      <label
                        htmlFor="logo-upload"
                        className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera size={16} className="text-white" />
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, "logoUrl")}
                      />
                    </div>
                    <span className="text-xs text-gray-400">200×200</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localConfig.primaryColor}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-10 h-10 rounded-xl cursor-pointer shadow-sm"
                    />
                    <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                      {localConfig.primaryColor}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Foto del Consultorio
                </label>
                <div className="relative h-48 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary transition-colors group">
                  {localConfig.clinicImage ? (
                    <img
                      src={localConfig.clinicImage}
                      alt="Consultorio"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Building size={48} />
                    </div>
                  )}
                  <label
                    htmlFor="clinic-image-upload"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={24} className="text-white" />
                  </label>
                  <input
                    id="clinic-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, "clinicImage")}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Recomendado: 800×600 px</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Servicios"
              icon={Stethoscope}
              iconColor={iconColors.services}
              gradientFrom={gradients.services.split(" ")[0]}
              gradientTo={gradients.services.split(" ")[1]}
            />
            <div className="p-5">
              <div className="space-y-4">
                {localServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200"
                  >
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          value={service.name}
                          onChange={(e) =>
                            updateService(service.id, "name", e.target.value)
                          }
                          placeholder="Nombre del servicio"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <textarea
                          value={service.description}
                          onChange={(e) =>
                            updateService(
                              service.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Descripción del servicio"
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        />
                      </div>
                      <button
                        onClick={() => removeService(service.id)}
                        className="text-gray-400 hover:text-red-500 mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={service.price}
                        onChange={(e) =>
                          updateService(service.id, "price", e.target.value)
                        }
                        placeholder="Precio"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <input
                        value={service.duration}
                        onChange={(e) =>
                          updateService(service.id, "duration", e.target.value)
                        }
                        placeholder="Duración"
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addService}
                  className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> Agregar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Doctor/a"
              icon={User}
              iconColor={iconColors.doctor}
              gradientFrom={gradients.doctor.split(" ")[0]}
              gradientTo={gradients.doctor.split(" ")[1]}
            />
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Nombre del Doctor/a
                </label>
                <input
                  value={localConfig.doctorName}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      doctorName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Especialidad
                </label>
                <input
                  value={localConfig.specialty}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      specialty: e.target.value,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Ej: Odontología General, Ortodoncia"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Phone size={16} /> Teléfono
                  </label>
                  <input
                    value={localConfig.phone}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, phone: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="+1 234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <Mail size={16} /> Email
                  </label>
                  <input
                    value={localConfig.email}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, email: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Foto del Doctor/a
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary transition-colors group">
                    {localConfig.doctorImage ? (
                      <img
                        src={localConfig.doctorImage}
                        alt="Doctor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Stethoscope size={24} />
                      </div>
                    )}
                    <label
                      htmlFor="doctor-image-upload"
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={16} className="text-white" />
                    </label>
                    <input
                      id="doctor-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, "doctorImage")}
                    />
                  </div>
                  <span className="text-xs text-gray-400">Foto 200×300</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SectionHeader
              title="Horarios"
              icon={Clock}
              iconColor={iconColors.schedule}
              gradientFrom={gradients.schedule.split(" ")[0]}
              gradientTo={gradients.schedule.split(" ")[1]}
            />
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(localSchedule).map(([day, config]) => (
                  <div
                    key={day}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      config.enabled
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    <button
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0 ${
                        config.enabled
                          ? "bg-primary text-white"
                          : "bg-gray-300 text-gray-500"
                      }`}
                    >
                      {config.enabled ? "✓" : "✕"}
                    </button>
                    <span className="w-24 text-sm font-semibold text-gray-700 flex-shrink-0">
                      {dayLabels[day]}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={config.open}
                        onChange={(e) =>
                          updateSchedule(day, "open", e.target.value)
                        }
                        disabled={!config.enabled}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-gray-400 font-semibold">→</span>
                      <input
                        type="time"
                        value={config.close}
                        onChange={(e) =>
                          updateSchedule(day, "close", e.target.value)
                        }
                        disabled={!config.enabled}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
