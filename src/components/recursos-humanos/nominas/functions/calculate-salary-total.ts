export const calcualteSalaryTotal = (dailySalary:any, workDays:any, sundayBonus:any, daysAbsences:any, holidaysWorked:any, permissions:any, others:any, additionals:any[], tipoDePago:string) => {
    let total = "";

    if(tipoDePago === "Semanal")
      dailySalary = dailySalary / 5;
    else if(tipoDePago === "Quincenal")
      dailySalary = dailySalary / 10;
    else if(tipoDePago === "Mensual")
      dailySalary = dailySalary / 20;

    dailySalary = (dailySalary) ? parseFloat(dailySalary) : 0;
    workDays = (workDays) ? parseFloat(workDays) : 0;
    sundayBonus = (sundayBonus) ? parseFloat(sundayBonus) : 0;
    daysAbsences = (daysAbsences) ? parseFloat(daysAbsences) : 0;
    // holidaysWorked = (holidaysWorked) ? parseFloat(holidaysWorked) : 0;
    permissions = (permissions) ? parseFloat(permissions) : 0;
    others = (others) ? parseFloat(others) : 0;

    total = (workDays * dailySalary) + (sundayBonus * dailySalary * 1.25) - (daysAbsences * dailySalary) - (permissions * dailySalary) + others;

    let totalAdditionals = 0;
    for(let i = 0; i < additionals.length; i++) {
      const additional = additionals[i];
      const multiplier = parseInt(additional.multiplicador);
      const operationType = additional.tipoDeOperacion;
      if(operationType === "suma")
        totalAdditionals += dailySalary * multiplier;
      else if(operationType === "resta")
        totalAdditionals -= dailySalary * multiplier;
    }
    total = total + totalAdditionals;
    total = parseFloat(total.toString()).toFixed(2);

    return total;
  };