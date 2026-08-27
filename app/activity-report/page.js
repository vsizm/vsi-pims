<Section
  n="10"
  title="Finance & Budget"
  description="Enter financial information based on available records. All amounts must be entered in Zambian Kwacha (ZMW). Totals and variance are calculated automatically."
>
  <div className="table-wrap">
    <table className="money-table">
      <thead>
        <tr>
          <th>Financial Item</th>
          <th>Approved Budget (ZMW)</th>
          <th>Actual Amount Spent (ZMW)</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {budgetItems.map((row,i)=>(
          <tr key={i}>
            <td>
              <input
                value={row.item}
                onChange={e=>setBudgetItems(
                  b=>b.map((x,j)=>j===i?{...x,item:e.target.value}:x)
                )}
              />
            </td>

            <td>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.approved}
                onChange={e=>setBudgetItems(
                  b=>b.map((x,j)=>j===i?{...x,approved:e.target.value}:x)
                )}
              />
            </td>

            <td>
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.actual}
                onChange={e=>setBudgetItems(
                  b=>b.map((x,j)=>j===i?{...x,actual:e.target.value}:x)
                )}
              />
            </td>

            <td>
              <button
                type="button"
                className="small-btn"
                onClick={()=>setBudgetItems(
                  b=>b.filter((_,j)=>j!==i)
                )}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="actions" style={{justifyContent:'flex-start'}}>
    <button
      type="button"
      className="small-btn"
      onClick={()=>setBudgetItems(
        b=>[...b,{item:'',approved:'',actual:''}]
      )}
    >
      + Add financial item
    </button>
  </div>

  <div className="grid" style={{marginTop:20}}>

    <Field
      label="Approved Budget (Total) — ZMW"
      name="approvedBudget"
      form={{...form,approvedBudget:totals.approved.toFixed(2)}}
      setForm={()=>{}}
      type="number"
    />

    <Field
      label="Actual Amount Spent (Total) — ZMW"
      name="actualSpent"
      form={{...form,actualSpent:totals.actual.toFixed(2)}}
      setForm={()=>{}}
      type="number"
    />

    <div>
      <label>
        Balance / (Overspend) — ZMW
        <input
          value={
            Math.abs(variance).toFixed(2) +
            (variance < 0 ? ' overspend' : ' balance')
          }
          readOnly
        />
      </label>
    </div>

    <Select
      label="Budget Status"
      name="budgetStatus"
      form={{...form,budgetStatus:form.budgetStatus||selectedBudget}}
      setForm={set}
      required
      options={budgetStatuses}
    />

  </div>

  {(form.budgetStatus||selectedBudget)==='Overspent'&&
    <div className="grid" style={{marginTop:20}}>

      <Field
        label="Amount Overspent — ZMW"
        name="overspendReason"
        form={{
          ...form,
          overspendReason:Math.abs(variance).toFixed(2)
        }}
        setForm={()=>{}}
      />

      <Text
        label="Reason for Overspend"
        name="overspendCause"
        form={form}
        setForm={set}
        required
      />

      <Select
        label="Was prior approval obtained?"
        name="priorApproval"
        form={form}
        setForm={set}
        required
        options={['Yes','No','Not applicable']}
      />

      <Field
        label="Approved by"
        name="overspendApprovedBy"
        form={form}
        setForm={set}
      />

      <Field
        label="Approval Date"
        name="overspendApprovalDate"
        form={form}
        setForm={set}
        type="date"
      />

      <Text
        label="Financial supporting documents"
        name="financialDocuments"
        form={form}
        setForm={set}
      />

    </div>
  }
</Section>
