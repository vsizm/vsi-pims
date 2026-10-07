'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, auth } from './finance-hr-api';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  Landmark,
  X,
} from 'lucide-react';

type User = { userId: string; username?: string; email?: string; name?: string; role?: string };
type Employee = {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  position: string;
  employmentType: string;
  status: string;
  email: string;
  phone: string;
  startDate: string;
  salary: number;
};
type Finance = {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  status: string;
  submittedBy: string;
  approvedBy?: string;
};
type Leave = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
};

const nav = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['hr', 'Human Resources', Users],
  ['contracts', 'Employment Contracts', FileText],
  ['finance', 'Finance', CircleDollarSign],
  ['controls', 'Financial Controls', WalletCards],
  ['accounting', 'Management Accounting', Landmark],
  ['suppliers', 'Suppliers & Procurement', BriefcaseBusiness],
  ['payroll', 'Payroll', WalletCards],
  ['procurement', 'Procurement', BriefcaseBusiness],
  ['projects', 'Projects & Donors', FileText],
  ['assets', 'Assets', BriefcaseBusiness],
  ['approvals', 'Approvals', CheckCircle2],
  ['reports', 'Reports', BarChart3],
  ['settings', 'Settings', Settings],
] as const;

function money(n: number) {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    maximumFractionDigits: 2,
  }).format(n);
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({ employees: [], finance: [], leaves: [], users: [], audit: [], suppliers: [] });
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const r = await api.get('/api/bootstrap');
      setData(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Unable to load VSI data.');
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const u = await auth.getUser();
        setUser(u as User | null);
        if (u) await load();
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading)
    return (
      <div className="splash">
        <ShieldCheck size={42} />
        <h1>VSI Finance & HR</h1>
        <p>Secure operations workspace</p>
      </div>
    );
  if (!user)
    return (
      <div className="finance-hr-root accessDenied">
        <div className="loginCard"><div className="brandmark large">VSI</div><p className="eyebrow">VSI IMS</p><h1>Finance & HR access required</h1><p>Please sign in to the IMS administration workspace first, then open Finance & HR.</p></div>
      </div>
    );
  const role = (data.currentUser?.role || user.role || 'staff').toLowerCase();
  const canFinance = ['admin', 'finance', 'director'].includes(role);
  const canApprove = ['admin', 'finance', 'hr', 'director'].includes(role);
  const employees = data.employees as Employee[];
  const finance = data.finance as Finance[];
  const leaves = data.leaves as Leave[];
  const pendingFinance = finance.filter(x => x.status === 'Pending').length,
    pendingLeave = leaves.filter(x => x.status === 'Pending').length;
  const totalExpense = finance
    .filter(x => x.type === 'Expense' && x.status === 'Approved')
    .reduce((a, x) => a + x.amount, 0);
  const totalIncome = finance
    .filter(x => x.type === 'Income' && x.status === 'Approved')
    .reduce((a, x) => a + x.amount, 0);
  const navItems = nav.filter(([key]) => key !== 'finance' || canFinance);
  const refresh = async () => {
    await load();
  };
  const action = async (path: string, body: any) => {
    setError('');
    try {
      await api.post(path, body);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Action could not be completed.');
    }
  };
  return (
    <div className="finance-hr-root"><div className="shell">
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brandmark">VSI</div>
          <div>
            <strong>VSI</strong>
            <span>Finance & HR</span>
          </div>
        </div>
        <nav>
          {navItems.map(([key, label, Icon]) => (
            <button
              key={key}
              className={page === key ? 'nav active' : 'nav'}
              onClick={() => {
                setPage(key);
                setOpen(false);
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sideBottom">
          <div className="role">
            <ShieldCheck size={16} />
            <span>{role}</span>
          </div>
          <button
            className="nav"
            onClick={async () => {
              await auth.signOut();
              setUser(null);
            }}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <main className="main">
        <header>
          <button className="mobileMenu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <p className="eyebrow">VISIONARY STUDENTS INITIATIVE</p>
            <h2>{nav.find(x => x[0] === page)?.[1] || 'Dashboard'}</h2>
          </div>
          <div className="headerRight">
            <span className="statusDot" /> System operational{' '}
            <div className="avatar">
              {(user.name || user.username || 'V').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        {error && (
          <div className="alert">
            <X size={17} />
            {error}
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}
        {page === 'dashboard' && (
          <Dashboard
            employees={employees}
            finance={finance}
            leaves={leaves}
            pendingFinance={pendingFinance}
            pendingLeave={pendingLeave}
            totalExpense={totalExpense}
            totalIncome={totalIncome}
            setPage={setPage}
          />
        )}
        {page === 'hr' && (
          <HR employees={employees} leaves={leaves} leaveBalances={data.leaveBalances||[]} role={role} action={action} />
        )}
        {page === 'contracts' && <Contracts data={data.contracts || []} employees={employees} role={role} action={action} />}
        {page === 'controls' && <Controls data={data} role={role} action={action} />}
        {page === 'accounting' && <Accounting data={data} role={role} action={action} />}
        {page === 'suppliers' && <Suppliers data={data} role={role} action={action} />}
        {page === 'finance' && (
          <Finance finance={finance} role={role} action={action} />
        )}
        {page === 'approvals' && (
          <Approvals
            finance={finance}
            leaves={leaves}
            canApprove={canApprove}
            action={action}
          />
        )}
        {page === 'reports' && (
          <Reports employees={employees} finance={finance} leaves={leaves} data={data} />
        )}
        {page === 'payroll' && <Payroll data={data.payroll || []} employees={employees} role={role} action={action} />}
        {page === 'procurement' && <Procurement data={data.procurement || []} role={role} action={action} />}
        {page === 'projects' && <Projects data={data.projects || []} role={role} action={action} />}
        {page === 'assets' && <Assets data={data.assets || []} role={role} action={action} />}
        {page === 'settings' && <SettingsPage data={data} role={role} action={action} />}
      </main>
    </div></div>
  );
}

function Login({ onLogin }: { onLogin: (username:string,password:string)=>Promise<void> }) {
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  return <div className="login"><div className="loginCard"><div className="brandmark large">VSI</div><p className="eyebrow">VISIONARY STUDENTS INITIATIVE</p><h1>Finance & HR Management</h1><p>One secure workspace for people, finance, approvals and organisational reporting.</p><form className="formGrid" onSubmit={async e=>{e.preventDefault();setMessage('');setBusy(true);try{await onLogin(username,password)}catch(err:any){setMessage(err?.message||'Unable to sign in.')}finally{setBusy(false)}}}><label className="wide">Username<input type="text" required value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false}/></label><label className="wide">Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>{message&&<div className="alert wide">{message}</div>}<button className="primary full wide" disabled={busy}>{busy?'Signing in…':'Sign in securely'}</button></form><small>Access is restricted to authorised VSI users.</small></div></div>;
}

function Dashboard({
  employees,
  finance,
  leaves,
  pendingFinance,
  pendingLeave,
  totalExpense,
  totalIncome,
  setPage,
}: any) {
  const [auditReady,setAuditReady]=useState<any>(null);useEffect(()=>{api.get('/api/reports/audit-readiness').then((r:any)=>setAuditReady(r.data)).catch(()=>setAuditReady(null));},[]);
  const recent = finance.slice(-5).reverse();
  return (
    <section>
      <div className="welcome">
        <div>
          <p className="eyebrow">OPERATIONS OVERVIEW</p>
          <h1>Good to see you.</h1>
          <p>Monitor people, money and outstanding actions from one place.</p>
        </div>
        <button className="primary" onClick={() => setPage('reports')}>
          <FileText size={17} />
          View reports
        </button>
      </div>
      <div className="cards">
        <Metric
          title="Active employees"
          value={employees.filter((x: any) => x.status === 'Active').length}
          icon={Users}
          note="Current staff records"
        />
        <Metric
          title="Approved expenses"
          value={money(totalExpense)}
          icon={WalletCards}
          note="Year-to-date"
        />
        <Metric
          title="Approved income"
          value={money(totalIncome)}
          icon={CircleDollarSign}
          note="Recorded receipts"
        />
        <Metric
          title="Awaiting action"
          value={pendingFinance + pendingLeave}
          icon={Bell}
          note="Finance + leave"
        />
      </div>
      <div className="moduleSection">
        <div className="moduleSectionHead">
          <div>
            <p className="eyebrow">FINANCE & HR WORKSPACE</p>
            <h3>Modules</h3>
            <p>Open any Finance & HR function directly from this dashboard.</p>
          </div>
        </div>
        <div className="moduleGrid">
          {navItems.filter(([key]) => key !== 'dashboard').map(([key, label, Icon]) => (
            <button key={key} className="moduleCard" onClick={() => setPage(key)}>
              <span className="moduleIcon"><Icon size={20} /></span>
              <span className="moduleCopy"><strong>{label}</strong><small>Open module</small></span>
              <span className="moduleArrow">→</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel" style={{marginTop:16}}><div className="panelHead"><div><h3>Management Control Centre</h3><p>Audit and month-end readiness across Finance and HR.</p></div><button className="secondary" onClick={()=>setPage('reports')}>Open reports</button></div>{auditReady?<div className="cards"><Metric title="Readiness" value={auditReady.ready?'Ready':'Action required'} icon={ShieldCheck} note={auditReady.score+'% control score'} /><Metric title="Exceptions" value={auditReady.summary?.exceptions||0} icon={Bell} note="Items requiring resolution" /><Metric title="Bank items" value={auditReady.summary?.unreconciledBank||0} icon={Landmark} note="Unreconciled" /><Metric title="Commitments" value={money(Number(auditReady.summary?.outstandingCommitments||0))} icon={WalletCards} note="Outstanding exposure" /></div>:<p>Control status unavailable.</p>}</div>
      <div className="grid2">
        <div className="panel">
          <div className="panelHead">
            <div>
              <h3>Pending actions</h3>
              <p>Items requiring authorised review.</p>
            </div>
          </div>
          <div className="actionRows">
            <ActionRow
              label="Finance transactions"
              count={pendingFinance}
              onClick={() => setPage('approvals')}
            />
            <ActionRow
              label="Leave requests"
              count={pendingLeave}
              onClick={() => setPage('approvals')}
            />
          </div>
        </div>
        <div className="panel">
          <div className="panelHead">
            <div>
              <h3>Recent finance activity</h3>
              <p>Latest recorded transactions.</p>
            </div>
          </div>
          {recent.length ? (
            recent.map((x: any) => (
              <div className="listRow" key={x.id}>
                <div>
                  <strong>{x.description}</strong>
                  <span>
                    {x.category} · {x.date}
                  </span>
                </div>
                <b className={x.type === 'Expense' ? 'expense' : 'income'}>
                  {x.type === 'Expense' ? '-' : '+'}
                  {money(x.amount)}
                </b>
              </div>
            ))
          ) : (
            <Empty text="No finance transactions yet." />
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ title, value, note, icon: Icon }: any) {
  return (
    <div className="metric">
      <div className="metricIcon">
        <Icon size={19} />
      </div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function ActionRow({ label, count, onClick }: any) {
  return (
    <button className="actionRow" onClick={onClick}>
      <span>{label}</span>
      <b>{count}</b>
      <ChevronDown size={17} />
    </button>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}

function HR({ employees, leaves, leaveBalances=[], role, action }: any) {
  const [tab,setTab]=useState('employees'); const [alerts,setAlerts]=useState<any>(null); const [alertsLoading,setAlertsLoading]=useState(false); const loadAlerts=async()=>{setAlertsLoading(true);try{const r=await api.get('/api/hr/alerts');setAlerts(r.data)}catch(e){setAlerts(null)}finally{setAlertsLoading(false)}};
  const [show,setShow]=useState(false);
  const [profile,setProfile]=useState<any>(null);
  const [form,setForm]=useState<any>({employeeNo:'',name:'',department:'',position:'',employmentType:'Full-time',status:'Active',email:'',phone:'',startDate:'',salary:'',annualLeaveEntitlement:24,grade:'',supervisor:'',contractType:'Full-time',bankName:'',bankAccountNumber:'',bankBranch:'',paymentMethod:'Bank transfer'});
  const admin=['admin','hr'].includes(role);
  const openProfile=async(id:string)=>{try{const r=await api.get('/api/hr/employees/profile',{id});setProfile(r.data)}catch(e:any){action('/api/_healthcheck',{});}};
  const statusChange=(e:any,status:string)=>{if(status===e.status)return;const reason=['On Leave','Suspended','Separated'].includes(status)?window.prompt('Reason for status change to '+status+':',''):'';if(['On Leave','Suspended','Separated'].includes(status)&&!String(reason||'').trim())return;action('/api/hr/employees/status',{id:e.id,status,reason});};
  return <section>
    <div className="sectionTop"><div><h1>People & HR</h1><p>Employee records, master data, leave management and workforce administration.</p></div>{admin&&<button className="primary" onClick={()=>setShow(true)}>+ Add employee</button>}</div>
    <div className="tabs"><button className={tab==='employees'?'selected':''} onClick={()=>setTab('employees')}>Employees ({employees.length})</button><button className={tab==='leave'?'selected':''} onClick={()=>setTab('leave')}>Leave ({leaves.length})</button><button className={tab==='balances'?'selected':''} onClick={()=>setTab('balances')}>Leave balances</button><button className={tab==='alerts'?'selected':''} onClick={()=>{setTab('alerts');loadAlerts()}}>HR alerts</button></div>
    {tab==='employees'&&<div className="panel tableWrap"><table><thead><tr><th>Employee</th><th>Department / Grade</th><th>Position / Supervisor</th><th>Type</th><th>Status</th><th>Salary</th><th>Profile</th></tr></thead><tbody>{employees.map((e:any)=><tr key={e.id}><td><strong>{e.name}</strong><span>{e.employeeNo} · {e.email||'No email'}</span></td><td>{e.department}<span>{e.grade||'Grade not set'}</span></td><td>{e.position}<span>{e.supervisor||'Supervisor not set'}</span></td><td>{e.contractType||e.employmentType}</td><td><span className={'badge '+(e.status==='Active'?'green':e.status==='Separated'?'red':'amber')}>{e.status}</span>{admin&&<select value={e.status||'Active'} onChange={ev=>statusChange(e,ev.target.value)}><option>Active</option><option>On Leave</option><option>Suspended</option><option>Separated</option></select>}</td><td>{money(Number(e.salary||0))}</td><td><button onClick={()=>openProfile(e.id)}>View profile</button></td></tr>)}{!employees.length&&<tr><td colSpan={7}><Empty text="No employees recorded yet."/></td></tr>}</tbody></table></div>}
    {tab==='leave'&&<LeaveTable leaves={leaves}/>}
    {tab==='alerts'&&<HRAlerts data={alerts} loading={alertsLoading}/>} {tab==='balances'&&<div className="panel tableWrap"><table><thead><tr><th>Employee</th><th>Entitlement</th><th>Used</th><th>Balance</th></tr></thead><tbody>{employees.map((e:any)=>{const used=leaves.filter((l:any)=>l.employeeId===e.id&&l.status==='Approved'&&(!l.type||l.type==='Annual')).reduce((s:number,l:any)=>s+Number(l.days||0),0);const ent=Number(e.annualLeaveEntitlement||24);const bal=Math.max(0,ent-used);return <tr key={e.id}><td><strong>{e.name}</strong></td><td>{ent} days</td><td>{used} days</td><td><span className={'badge '+(bal<=3?'amber':'green')}>{bal} days</span></td></tr>})}</tbody></table></div>}
    {show&&<Modal title="Add employee" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/hr/employees',form);setShow(false)}}>{[['employeeNo','Employee number'],['name','Full name'],['department','Department'],['position','Position'],['email','Email'],['phone','Phone'],['startDate','Start date'],['salary','Salary (ZMW)'],['grade','Grade'],['supervisor','Supervisor']].map(([k,l]:any)=><label key={k}>{l}<input required={['employeeNo','name','department','position'].includes(k)} type={k==='salary'?'number':k==='startDate'?'date':'text'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<label>Contract type<select value={form.contractType} onChange={e=>setForm({...form,contractType:e.target.value,employmentType:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Fixed-term</option><option>Consultancy</option><option>Volunteer</option><option>Internship</option></select></label><label>Annual leave entitlement (days)<input type="number" min="0" max="365" value={form.annualLeaveEntitlement} onChange={e=>setForm({...form,annualLeaveEntitlement:Number(e.target.value)})}/></label><div className="wide"><h4>Payment details <span>HR / Admin only</span></h4></div><label>Bank name<input value={form.bankName} onChange={e=>setForm({...form,bankName:e.target.value})}/></label><label>Account number<input value={form.bankAccountNumber} onChange={e=>setForm({...form,bankAccountNumber:e.target.value})}/></label><label>Branch<input value={form.bankBranch} onChange={e=>setForm({...form,bankBranch:e.target.value})}/></label><label>Payment method<select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}><option>Bank transfer</option><option>Cash</option><option>Mobile money</option></select></label><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Save employee</button></div></form></Modal>}
    {profile&&<Modal title={'Employee profile — '+profile.employee.name} onClose={()=>setProfile(null)}><div className="panel"><div className="grid2"><div><span className="eyebrow">EMPLOYMENT</span><p><strong>{profile.employee.position}</strong><br/>{profile.employee.department} · {profile.employee.grade||'Grade not set'}<br/>Supervisor: {profile.employee.supervisor||'Not set'}<br/>Contract: {profile.employee.contractType||profile.employee.employmentType}<br/>Start: {profile.employee.startDate||'Not set'}<br/>Salary: {money(profile.employee.salary||0)}</p></div><div><span className="eyebrow">STATUS</span><p><strong>{profile.employee.status}</strong><br/>{profile.employee.statusReason||'No current status note'}<br/>Leave balance: {profile.leaveBalance.balance} / {profile.leaveBalance.entitlement} days</p></div></div><div className="panel"><h4>Payment details — restricted</h4><p>{profile.bank?.bankName||'Bank not recorded'} · {profile.bank?.bankBranch||'Branch not recorded'}<br/>Account: {profile.bank?.bankAccountNumber||'Not recorded'}<br/>Method: {profile.bank?.paymentMethod||'Not recorded'}</p></div><div className="panel"><h4>Status history</h4>{profile.statusHistory?.length?profile.statusHistory.map((h:any)=><div className="listRow" key={h.id}><div><strong>{h.newStatus}</strong><span>{h.oldStatus||'New record'} → {h.reason||'No reason recorded'}</span></div><small>{new Date(h.changedAt).toLocaleString()}</small></div>):<Empty text="No status history recorded."/ >}</div></div></Modal>}
  </section>;
}

function HRAlerts({data,loading}:any){if(loading)return <div className="panel"><p>Loading HR alerts…</p></div>;if(!data)return <div className="panel"><p>Unable to load HR alerts.</p></div>;const total=Object.values(data.counts||{}).reduce((s:any,x:any)=>s+Number(x||0),0);return <div><div className="cards"><Metric title="Alerts" value={total} icon={Bell} note="HR exceptions"/><Metric title="Contracts expiring" value={data.counts.contractAlerts} icon={FileText} note="Next 90 days"/><Metric title="Payroll mismatches" value={data.counts.payrollMismatch} icon={CircleDollarSign} note="HR salary vs payroll"/><Metric title="Incomplete records" value={data.counts.incomplete} icon={Users} note="Master data"/></div><div className="grid2"><div className="panel"><div className="panelHead"><div><h3>Contract expiry</h3><p>Contracts requiring renewal or review.</p></div></div>{data.contractAlerts.length?data.contractAlerts.map((x:any)=><div className="listRow" key={x.employeeId+x.endDate}><div><strong>{x.employeeName}</strong><span>{x.type} · ends {x.endDate}</span></div><b>{x.daysLeft} days</b></div>):<Empty text="No contracts expire within 90 days."/>}</div><div className="panel"><div className="panelHead"><div><h3>Payroll reconciliation</h3><p>Gross salary differs from the authorised HR salary.</p></div></div>{data.payrollMismatch.length?data.payrollMismatch.map((x:any)=><div className="listRow" key={x.employeeId+x.period}><div><strong>{x.employeeName}</strong><span>{x.period} · HR {money(x.hrSalary)} vs payroll {money(x.payrollGross)}</span></div><span className="badge red">{x.status}</span></div>):<Empty text="No payroll salary mismatches found."/>}</div><div className="panel"><div className="panelHead"><div><h3>Leave balance warnings</h3><p>Employees with 3 or fewer annual leave days remaining.</p></div></div>{data.lowLeave.length?data.lowLeave.map((x:any)=><div className="listRow" key={x.employeeId}><div><strong>{x.employeeName}</strong><span>{x.used} of {x.entitlement} days used</span></div><span className="badge amber">{x.balance} days left</span></div>):<Empty text="No low leave balances."/>}</div><div className="panel"><div className="panelHead"><div><h3>Incomplete employee records</h3><p>Master-data fields that should be completed.</p></div></div>{data.incomplete.length?data.incomplete.map((x:any)=><div className="listRow" key={x.employeeId}><div><strong>{x.employeeName}</strong><span>{x.missing.join(' · ')}</span></div><span className="badge amber">Action</span></div>):<Empty text="All active employee master records are complete."/>}</div></div></div>}
function LeaveTable({ leaves }: any) {
  return (
    <div className="panel tableWrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l: any) => (
            <tr key={l.id}>
              <td>{l.employeeName}</td>
              <td>{l.type}</td>
              <td>
                {l.startDate} → {l.endDate}
              </td>
              <td>{l.days}</td>
              <td>
                <span
                  className={
                    'badge ' +
                    (l.status === 'Approved'
                      ? 'green'
                      : l.status === 'Rejected'
                        ? 'red'
                        : 'amber')
                  }
                >
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Finance({ finance, role, action }: any) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({
    date: new Date().toISOString().slice(0, 10),
    type: 'Expense',
    category: 'Operations',
    description: '',
    amount: '',
  });
  const approved = finance.filter((x: any) => x.status === 'Approved');
  const balance = approved.reduce(
    (a: any, x: any) => a + (x.type === 'Income' ? x.amount : -x.amount),
    0
  );
  return (
    <section>
      <div className="sectionTop">
        <div>
          <h1>Finance</h1>
          <p>Income, expenses, budgets and financial controls.</p>
        </div>
        {['admin', 'finance', 'director'].includes(role) && (
          <button className="primary" onClick={() => setShow(true)}>
            + New transaction
          </button>
        )}
      </div>
      <div className="cards">
        <Metric
          title="Income"
          value={money(
            approved
              .filter((x: any) => x.type === 'Income')
              .reduce((a: any, x: any) => a + x.amount, 0)
          )}
          icon={CircleDollarSign}
          note="Approved"
        />
        <Metric
          title="Expenses"
          value={money(
            approved
              .filter((x: any) => x.type === 'Expense')
              .reduce((a: any, x: any) => a + x.amount, 0)
          )}
          icon={WalletCards}
          note="Approved"
        />
        <Metric
          title="Net position"
          value={money(balance)}
          icon={BarChart3}
          note="Approved transactions"
        />
        <Metric
          title="Pending"
          value={finance.filter((x: any) => x.status === 'Pending').length}
          icon={Bell}
          note="Awaiting approval"
        />
      </div>
      <div className="panel tableWrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {finance.map((x: any) => (
              <tr key={x.id}>
                <td>{x.date}</td>
                <td>{x.type}</td>
                <td>
                  <strong>{x.description}</strong>
                  <span>{x.submittedBy || 'VSI'}</span>
                </td>
                <td>{x.category}</td>
                <td>{money(x.amount)}</td>
                <td>
                  <span
                    className={
                      'badge ' +
                      (x.status === 'Approved'
                        ? 'green'
                        : x.status === 'Rejected'
                          ? 'red'
                          : 'amber')
                    }
                  >
                    {x.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <Modal title="New finance transaction" onClose={() => setShow(false)}>
          <form
            onSubmit={e => {
              e.preventDefault();
              action('/api/finance/transactions', form);
              setShow(false);
            }}
            className="formGrid"
          >
            <label>
              Date
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                <option>Expense</option>
                <option>Income</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option>Operations</option>
                <option>Programme</option>
                <option>Transport</option>
                <option>Staff</option>
                <option>Office</option>
                <option>Grant</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Amount (ZMW)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </label>
            <label>
              Project / donor code
              <input
                value={form.project || ''}
                onChange={e => setForm({ ...form, project: e.target.value })}
                placeholder="Optional project code"
              />
            </label>
            <label className="wide">
              Description
              <input
                required
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <div className="formActions">
              <button type="button" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button className="primary">Submit for approval</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

function Approvals({ finance, leaves, canApprove, action }: any) {
  const pendingF = finance.filter((x: any) => x.status === 'Pending'),
    pendingL = leaves.filter((x: any) => x.status === 'Pending');
  return (
    <section>
      <div className="sectionTop">
        <div>
          <h1>Approvals</h1>
          <p>Review finance and HR requests with a clear audit trail.</p>
        </div>
      </div>
      {!canApprove && (
        <div className="alert">
          <ShieldCheck size={17} />
          You can view this queue, but your role does not have approval
          authority.
        </div>
      )}
      <div className="grid2">
        <div className="panel">
          <div className="panelHead">
            <div>
              <h3>Finance approvals</h3>
              <p>{pendingF.length} pending</p>
            </div>
          </div>
          {pendingF.map((x: any) => (
            <ApprovalCard
              key={x.id}
              title={x.description}
              meta={x.category + ' · ' + x.date}
              amount={money(x.amount)}
              onApprove={() =>
                action('/api/approvals/finance', {
                  id: x.id,
                  status: 'Approved',
                })
              }
              onReject={() =>
                action('/api/approvals/finance', {
                  id: x.id,
                  status: 'Rejected',
                })
              }
              disabled={!canApprove}
            />
          ))}
          {!pendingF.length && <Empty text="No finance approvals pending." />}
        </div>
        <div className="panel">
          <div className="panelHead">
            <div>
              <h3>Leave approvals</h3>
              <p>{pendingL.length} pending</p>
            </div>
          </div>
          {pendingL.map((x: any) => (
            <ApprovalCard
              key={x.id}
              title={x.employeeName}
              meta={x.type + ' · ' + x.startDate + ' to ' + x.endDate}
              amount={x.days + ' days'}
              onApprove={() =>
                action('/api/approvals/leave', { id: x.id, status: 'Approved' })
              }
              onReject={() =>
                action('/api/approvals/leave', { id: x.id, status: 'Rejected' })
              }
              disabled={!canApprove}
            />
          ))}
          {!pendingL.length && <Empty text="No leave approvals pending." />}
        </div>
      </div>
    </section>
  );
}

function ApprovalCard({
  title,
  meta,
  amount,
  onApprove,
  onReject,
  disabled,
}: any) {
  return (
    <div className="approval">
      <div>
        <strong>{title}</strong>
        <span>{meta}</span>
      </div>
      <b>{amount}</b>
      <div className="approvalBtns">
        <button disabled={disabled} onClick={onReject}>
          Reject
        </button>
        <button className="primary" disabled={disabled} onClick={onApprove}>
          Approve
        </button>
      </div>
    </div>
  );
}

function Reports({ employees, finance, leaves, data }: any) {
  const [type,setType]=useState('Management Accounts'); const [month,setMonth]=useState(new Date().toISOString().slice(0,7));
  const [management,setManagement]=useState<any>(null); const [donor,setDonor]=useState<any[]>([]); const [commitments,setCommitments]=useState<any>(null); const [statements,setStatements]=useState<any>(null); const [periods,setPeriods]=useState<any[]>([]); const [projectFilter,setProjectFilter]=useState('All'); const [loading,setLoading]=useState(false);
  const load=async()=>{setLoading(true);try{if(type==='Management Accounts'){const r=await api.get('/api/reports/management-accounts');setManagement(r.data)}else if(type==='Donor Expenditure'){const r=await api.get('/api/reports/donor-expenditure');setDonor(r.data||[])}else if(type==='Commitment Register'){const r=await api.get('/api/reports/commitments');setCommitments(r.data)}else if(type==='Financial Statements'){const r=await api.get('/api/reports/financial-statements');setStatements(r.data)}else if(type==='Period Close'){const r=await api.get('/api/accounting/periods');setPeriods(r.data||[])}}catch{}finally{setLoading(false)}}; useEffect(()=>{load()},[type]);
  const exportCsv=(h:any[],b:any[][],name:string)=>{const csv=[h,...b].map(r=>r.map(v=>JSON.stringify(v??'')).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
  const projects=(management?.byProject||[]).filter((x:any)=>projectFilter==='All'||x.code===projectFilter); const donorRows=donor.filter((x:any)=>projectFilter==='All'||x.code===projectFilter); const rows=type==='Finance'?finance.filter((x:any)=>x.date.startsWith(month)):type==='HR'?employees:leaves.filter((x:any)=>x.startDate.startsWith(month));
  const exportCurrent=()=>{if(type==='Commitment Register')exportCsv(['Source','Reference','Project','Description','Original','Paid','Outstanding','Status'],(commitments?.rows||[]).map((x:any)=>[x.source,x.reference,x.project,x.description,x.original,x.paid,x.outstanding,x.status]),'vsi-commitment-register.csv');else if(type==='Management Accounts')exportCsv(['Code','Project','Donor','Budget','Actual','Commitments','Balance','Available','Utilisation','Status'],projects.map((x:any)=>[x.code,x.name,x.donor,x.budget,x.actual,x.commitments,x.balance,x.available,x.utilisation+'%',x.status]),'vsi-management-accounts.csv');else if(type==='Donor Expenditure')exportCsv(['Code','Project','Donor','Budget','Actual','Balance','Utilisation'],donorRows.map((x:any)=>[x.code,x.name,x.donor,x.budget,x.actual,x.balance,x.utilisation+'%']),'vsi-donor-expenditure.csv');else if(type==='Financial Statements'&&statements)exportCsv(['Statement','Item','Amount'],[['Income','Income',statements.income],['Income','Expenditure',statements.expense],['Income','Surplus / deficit',statements.surplus],['Financial Position','Assets',statements.assets],['Financial Position','Liabilities',statements.liabilities],['Financial Position','Equity',statements.equity],['Financial Position','Current surplus',statements.currentSurplus],['Cash Flow','Bank movement',statements.cashMovement]],'vsi-financial-statements.csv');else exportCsv(type==='Finance'?['Date','Type','Description','Amount','Status']:type==='HR'?['Employee No','Name','Department','Position','Status','Salary']:['Employee','Type','Start','End','Days','Status'],rows.map((x:any)=>type==='Finance'?[x.date,x.type,x.description,x.amount,x.status]:type==='HR'?[x.employeeNo,x.name,x.department,x.position,x.status,x.salary]:[x.employeeName,x.type,x.startDate,x.endDate,x.days,x.status]),'vsi-'+type.toLowerCase()+'-report.csv')};
  return <section><div className="sectionTop"><div><h1>Reports & Financial Statements</h1><p>Management accounts, donor reporting, statutory operations and formal financial statements.</p></div><button className="primary" onClick={exportCurrent}>Export CSV</button></div>
  <div className="reportControls"><label>Report<select value={type} onChange={e=>{setType(e.target.value);setProjectFilter('All')}}><option>Management Accounts</option><option>Donor Expenditure</option><option>Financial Statements</option><option>Commitment Register</option><option>Period Close</option><option>Finance</option><option>HR</option><option>Leave</option></select></label>{['Finance','Leave'].includes(type)&&<label>Period<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>}{['Management Accounts','Donor Expenditure'].includes(type)&&<label>Project<select value={projectFilter} onChange={e=>setProjectFilter(e.target.value)}><option>All</option>{(management?.byProject||donor).map((x:any)=><option key={x.code} value={x.code}>{x.code} — {x.name}</option>)}</select></label>}</div>
  {type==='Commitment Register'&&<><div className="cards"><Metric title="Outstanding commitments" value={loading?'…':money(commitments?.total||0)} icon={WalletCards} note={(commitments?.count||0)+' open items'}/></div><div className="panel tableWrap"><table><thead><tr><th>Source</th><th>Reference</th><th>Project</th><th>Description</th><th>Original</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>{(commitments?.rows||[]).map((x:any)=><tr key={x.source+x.reference}><td>{x.source}</td><td>{x.reference}</td><td>{x.project||'—'}</td><td>{x.description}</td><td>{money(x.original)}</td><td>{money(x.paid)}</td><td><strong>{money(x.outstanding)}</strong></td><td><span className="badge amber">{x.status}</span></td></tr>)}{!(commitments?.rows||[]).length&&<tr><td colSpan={8}><Empty text="No outstanding commitments."/></td></tr>}</tbody></table></div></>}{type==='Management Accounts'&&<><div className="cards"><Metric title="Approved income" value={loading?'…':money(management?.income||0)} icon={CircleDollarSign} note="Approved"/><Metric title="Expenditure" value={loading?'…':money(management?.expense||0)} icon={WalletCards} note="Approved"/><Metric title="Net position" value={loading?'…':money(management?.net||0)} icon={BarChart3} note="Income less expenditure"/><Metric title="Available budget" value={loading?'…':money(management?.availableBudget||0)} icon={Landmark} note="After commitments"/></div><div className="panel tableWrap"><table><thead><tr><th>Project</th><th>Donor</th><th>Budget</th><th>Actual</th><th>Commitments</th><th>Available</th><th>Status</th></tr></thead><tbody>{projects.map((x:any)=><tr key={x.code}><td>{x.code} — {x.name}</td><td>{x.donor}</td><td>{money(x.budget)}</td><td>{money(x.actual)}</td><td>{money(x.commitments)}</td><td>{money(x.available)}</td><td><span className={'badge '+(x.status==='Overspent'?'red':x.status==='Low headroom'?'amber':'green')}>{x.status}</span></td></tr>)}</tbody></table></div></>}
  {type==='Donor Expenditure'&&<div className="panel tableWrap"><table><thead><tr><th>Project</th><th>Donor</th><th>Budget</th><th>Actual</th><th>Balance</th><th>Utilisation</th></tr></thead><tbody>{donorRows.map((x:any)=><tr key={x.code}><td>{x.code} — {x.name}</td><td>{x.donor}</td><td>{money(x.budget)}</td><td>{money(x.actual)}</td><td>{money(x.balance)}</td><td>{x.utilisation}%</td></tr>)}</tbody></table></div>}
  {type==='Financial Statements'&&<><div className="cards"><Metric title="Income" value={loading?'…':money(statements?.income||0)} icon={CircleDollarSign} note="Posted journals"/><Metric title="Expenditure" value={loading?'…':money(statements?.expense||0)} icon={WalletCards} note="Posted journals"/><Metric title="Surplus / deficit" value={loading?'…':money(statements?.surplus||0)} icon={BarChart3} note="Current period cumulative"/><Metric title="Assets" value={loading?'…':money(statements?.assets||0)} icon={Landmark} note="Statement of financial position"/></div><div className="panel tableWrap"><table><thead><tr><th>Statement</th><th>Item</th><th>Amount</th></tr></thead><tbody><tr><td>Income & Expenditure</td><td>Income</td><td>{money(statements?.income||0)}</td></tr><tr><td>Income & Expenditure</td><td>Expenditure</td><td>{money(statements?.expense||0)}</td></tr><tr><td>Income & Expenditure</td><td><strong>Surplus / deficit</strong></td><td><strong>{money(statements?.surplus||0)}</strong></td></tr><tr><td>Financial Position</td><td>Assets</td><td>{money(statements?.assets||0)}</td></tr><tr><td>Financial Position</td><td>Liabilities</td><td>{money(statements?.liabilities||0)}</td></tr><tr><td>Financial Position</td><td>Equity</td><td>{money(statements?.equity||0)}</td></tr><tr><td>Financial Position</td><td>Current surplus</td><td>{money(statements?.currentSurplus||0)}</td></tr><tr><td>Cash Flow</td><td>Bank movement</td><td>{money(statements?.cashMovement||0)}</td></tr></tbody></table></div></>}
  {type==='Period Close'&&<div className="panel tableWrap"><table><thead><tr><th>Period</th><th>Status</th><th>Closed at</th></tr></thead><tbody>{periods.map((p:any)=><tr key={p.id}><td>{p.period}</td><td><span className={'badge '+(p.status==='Closed'?'red':'green')}>{p.status}</span></td><td>{p.closedAt||'—'}</td></tr>)}{!periods.length&&<tr><td colSpan={3}><Empty text="No accounting periods have been closed."/></td></tr>}</tbody></table></div>}
  {!['Management Accounts','Donor Expenditure','Financial Statements','Commitment Register','Period Close'].includes(type)&&<div className="panel tableWrap"><table><thead><tr>{(type==='Finance'?['Date','Type','Description','Amount','Status']:type==='HR'?['Employee','Department','Position','Status','Salary']:['Employee','Type','Start','End','Days','Status']).map((h:string)=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((x:any)=><tr key={x.id}>{type==='Finance'?<><td>{x.date}</td><td>{x.type}</td><td>{x.description}</td><td>{money(x.amount)}</td><td>{x.status}</td></>:type==='HR'?<><td>{x.name}</td><td>{x.department}</td><td>{x.position}</td><td>{x.status}</td><td>{money(x.salary||0)}</td></>:<><td>{x.employeeName}</td><td>{x.type}</td><td>{x.startDate}</td><td>{x.endDate}</td><td>{x.days}</td><td>{x.status}</td></>}</tr>)}</tbody></table></div>}</section>;
}
function SettingsPage({ data, role, action }: any) {
  const users = data.users || [];
  const canThresholds = ['admin','director'].includes(role);
  const [thresholds, setThresholds] = useState<any>(data.approvalThresholds || { low: 5000, medium: 25000, high: 100000 });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data.approvalThresholds) setThresholds(data.approvalThresholds); }, [data.approvalThresholds]);
  const saveThresholds = async () => {
    setSaving(true);
    try {
      await api.post('/api/settings/approval-thresholds', { low:Number(thresholds.low), medium:Number(thresholds.medium), high:Number(thresholds.high) });
      await action('/api/settings/approval-thresholds', { low:Number(thresholds.low), medium:Number(thresholds.medium), high:Number(thresholds.high) });
    } catch {}
    finally { setSaving(false); }
  };
  return <section>
    <div className="sectionTop"><div><h1>System settings</h1><p>User roles and organisational financial controls.</p></div></div>
    <div className="panel">
      <div className="panelHead"><div><h3>Approval thresholds</h3><p>Configure value bands used by the approval workflow. High-value transactions require Director or Administrator approval.</p></div></div>
      <div className="formGrid">
        <label>Low threshold (ZMW)<input type="number" min="0" value={thresholds.low} disabled={!canThresholds} onChange={e=>setThresholds({...thresholds,low:e.target.value})}/></label>
        <label>Medium threshold (ZMW)<input type="number" min="0" value={thresholds.medium} disabled={!canThresholds} onChange={e=>setThresholds({...thresholds,medium:e.target.value})}/></label>
        <label>High threshold (ZMW)<input type="number" min="0" value={thresholds.high} disabled={!canThresholds} onChange={e=>setThresholds({...thresholds,high:e.target.value})}/></label>
        <div><span className="eyebrow">CURRENT POLICY</span><p>Low ≤ {money(Number(thresholds.low)||0)} · Medium ≤ {money(Number(thresholds.medium)||0)} · Director escalation above {money(Number(thresholds.high)||0)}</p></div>
      </div>
      {canThresholds && <div className="formActions"><button className="primary" disabled={saving} onClick={saveThresholds}>{saving?'Saving…':'Save approval thresholds'}</button></div>}
      {!canThresholds && <p>Only Administrators and Directors can change approval thresholds.</p>}
    </div>
    <div className="panel">
      <div className="panelHead"><div><h3>Access roles</h3><p>Assign least-privilege roles to VSI users.</p></div></div>
      {users.map((u:any)=><div className="listRow" key={u.id}><div><strong>{u.name||u.email}</strong><span>{u.email}</span></div>{role==='admin'?<select value={u.role} onChange={e=>action('/api/users/role',{id:u.id,role:e.target.value})}><option>staff</option><option>hr</option><option>finance</option><option>director</option><option>admin</option></select>:<span className="badge">{u.role}</span>}</div>)}
    </div>
    <div className="panel audit"><div className="panelHead"><div><h3>Audit trail</h3><p>Recorded system actions.</p></div></div>{(data.audit||[]).slice(-20).reverse().map((a:any)=><div className="listRow" key={a.id}><div><strong>{a.action}</strong><span>{a.entity} · {a.actor}</span></div><small>{new Date(a.createdAt).toLocaleString()}</small></div>)}</div>
  </section>;
}
function Controls({data,role,action}:any){const [tab,setTab]=useState('dashboard');const [rows,setRows]=useState<any[]>([]);const [summary,setSummary]=useState<any>(null);const [period,setPeriod]=useState(new Date().toISOString().slice(0,7));const [loading,setLoading]=useState(false);const can=['admin','finance','hr','director'].includes(role);const load=async()=>{setLoading(true);try{const r=await api.get('/api/controls/dashboard',{period});setRows(r.data.exceptions||[]);setSummary(r.data.summary||null)}catch{setRows([]);setSummary(null)}finally{setLoading(false)}};useEffect(()=>{if(can)load()},[period]);const update=async(x:any)=>{const status=window.prompt('Status: Open, In Progress or Resolved',x.status||'Open');if(!status)return;let resolution=x.resolution||'';if(status==='Resolved'){resolution=window.prompt('Resolution note:',resolution)||'';if(!resolution)return;}const ownerRole=window.prompt('Responsible function (Finance / HR / Director):',x.ownerRole||'Finance')||x.ownerRole;const dueDate=window.prompt('Due date (YYYY-MM-DD):',x.dueDate||'')||x.dueDate;await action('/api/controls/exception-update',{id:x.id,status,ownerRole,dueDate,resolution});await load()};return <section><div className="sectionTop"><div><h1>Financial Controls</h1><p>Control exceptions, budgeting, purchasing and reconciliation.</p></div></div><div className="panel" style={{marginBottom:16}}><div className="formGrid"><label>Control period<input type="month" value={period} onChange={e=>setPeriod(e.target.value)}/></label><div><span className="eyebrow">CONTROL STATUS</span><div><span className={'badge '+(summary?.open?'red':'green')}>{loading?'Checking…':summary?.open?'Action required':'Ready'}</span></div></div></div></div>{summary&&<div className="cards"><Metric title="Open exceptions" value={summary.open} icon={Bell} note="Require management action"/><Metric title="Critical" value={summary.critical} icon={ShieldCheck} note="Immediate attention"/><Metric title="High" value={summary.high} icon={CircleDollarSign} note="Priority controls"/><Metric title="Unreconciled bank" value={summary.unreconciledBank} icon={Landmark} note="Finance review"/></div>}<div className="tabs"><button className={tab==='dashboard'?'selected':''} onClick={()=>setTab('dashboard')}>Control Centre</button><button className={tab==='budgets'?'selected':''} onClick={()=>setTab('budgets')}>Budgets & Procurement</button></div>{tab==='dashboard'&&<div className="panel tableWrap"><table><thead><tr><th>Control</th><th>Category</th><th>Severity</th><th>Owner</th><th>Due</th><th>Status</th><th>Resolution</th></tr></thead><tbody>{rows.map((x:any)=><tr key={x.id}><td><strong>{x.code}</strong><span>{x.description}</span></td><td>{x.category}</td><td><span className={'badge '+(x.severity==='Critical'?'red':x.severity==='High'?'amber':'green')}>{x.severity}</span></td><td>{x.ownerRole}</td><td>{x.dueDate||'—'}</td><td><span className={'badge '+(x.status==='Resolved'?'green':x.status==='In Progress'?'amber':'red')}>{x.status}</span></td><td>{x.status!=='Resolved'?<button onClick={()=>update(x)}>Update</button>:<span>{x.resolution}</span>}</td></tr>)}{!rows.length&&<tr><td colSpan={7}><Empty text="No open control exceptions for this period."/></td></tr>}</tbody></table></div>}{tab==='budgets'&&<div className="panel tableWrap"><table><thead><tr><th>Reference</th><th>Linked PO</th><th>Project / Supplier</th><th>Amount</th><th>Status / Match</th></tr></thead><tbody>{(data.purchaseOrders||[]).map((x:any)=><tr key={x.id}><td><strong>{x.code||x.id}</strong><span>{x.description||''}</span></td><td>{x.code||'—'}</td><td>{x.project||x.supplier||'—'}</td><td>{money(x.amount||0)}</td><td>{x.status}</td></tr>)}</tbody></table></div>}</section>}
function Accounting({data,role,action}:any){const [tab,setTab]=useState('budget');const [show,setShow]=useState(false);const [form,setForm]=useState<any>({});const [recon,setRecon]=useState<any>(null);const loadRecon=async()=>{try{const r=await api.get('/api/accounting/reconciliation');setRecon(r.data)}catch{setRecon(null)}};useEffect(()=>{if(tab==='reconcile')loadRecon()},[tab]);const can=['admin','finance','director'].includes(role);const budgets=data.budgets||[],finance=data.finance||[],accounts=data.accounts||[],journals=data.journals||[],bankTx=data.bankTransactions||[],bankAccounts=data.bankAccounts||[];const expenses=finance.filter((x:any)=>x.type==='Expense'&&x.status==='Approved');const totalBudget=budgets.reduce((s:number,x:any)=>s+Number(x.amount||0),0),totalActual=expenses.reduce((s:number,x:any)=>s+Number(x.amount||0),0),cash=bankTx.reduce((s:number,x:any)=>s+(x.type==='Deposit'?Number(x.amount||0):-Number(x.amount||0)),0);const reset=(t:string)=>setForm(t==='accounts'?{code:'',name:'',type:'Asset'}:t==='bankAccounts'?{name:'',accountNo:'',branch:'',currency:'ZMW'}:t==='cash'?{account:'',date:new Date().toISOString().slice(0,10),type:'Deposit',description:'',amount:''}:{date:new Date().toISOString().slice(0,10),description:'',reference:'',debitAccount:'',creditAccount:'',amount:''});const submit=()=>{if(tab==='accounts')action('/api/accounting/accounts',form);else if(tab==='bankAccounts')action('/api/accounting/bank-accounts',form);else if(tab==='cash')action('/api/accounting/bank-transactions',{...form,amount:Number(form.amount||0)});else{const n=Number(form.amount||0);action('/api/accounting/journals',{date:form.date,description:form.description,reference:form.reference,lines:[{accountId:form.debitAccount,debit:n,credit:0},{accountId:form.creditAccount,debit:0,credit:n}]});}setShow(false)};const balances=accounts.map((a:any)=>{let debit=0,credit=0;journals.filter((j:any)=>j.status==='Posted').forEach((j:any)=>(j.lines||[]).filter((l:any)=>l.accountId===a.id).forEach((l:any)=>{debit+=Number(l.debit||0);credit+=Number(l.credit||0)}));return {...a,debit,credit,balance:debit-credit};});return <section><div className="sectionTop"><div><h1>Management Accounting</h1><p>Budget performance, cash management and double-entry accounting.</p></div>{can&&<button className="primary" onClick={()=>{reset(tab);setShow(true)}}>+ {tab==='accounts'?'Account':tab==='cash'?'Bank transaction':'Journal'}</button>}</div><div className="stats"><div className="stat"><span>Total budget</span><strong>{money(totalBudget)}</strong></div><div className="stat"><span>Approved expenditure</span><strong>{money(totalActual)}</strong></div><div className="stat"><span>Budget variance</span><strong>{money(totalBudget-totalActual)}</strong></div><div className="stat"><span>Cashbook balance</span><strong>{money(cash)}</strong></div></div><div className="tabs">{[['budget','Budget vs Actual'],['cash','Cashbook'],['bankAccounts','Bank Accounts'],['reconcile','Reconciliation'],['accounts','Chart of Accounts'],['journals','Journals'],['trial','Trial Balance']].map(([k,l])=><button key={k} className={tab===k?'selected':''} onClick={()=>setTab(k)}>{l}</button>)}</div>{tab==='budget'&&<div className="panel tableWrap"><table><thead><tr><th>Budget</th><th>Project</th><th>Budget</th><th>Actual</th><th>Variance</th></tr></thead><tbody>{budgets.map((b:any)=><tr key={b.id}><td>{b.code}</td><td>{b.project||b.name}</td><td>{money(b.amount||0)}</td><td>{money(expenses.filter((e:any)=>e.project===b.project).reduce((s:number,e:any)=>s+Number(e.amount||0),0))}</td><td>{money(Number(b.amount||0)-expenses.filter((e:any)=>e.project===b.project).reduce((s:number,e:any)=>s+Number(e.amount||0),0))}</td></tr>)}</tbody></table></div>}{tab==='cash'&&<div className="panel tableWrap"><table><thead><tr><th>Date</th><th>Account</th><th>Type</th><th>Description</th><th>Amount</th><th>Reconciled</th></tr></thead><tbody>{bankTx.map((x:any)=><tr key={x.id}><td>{x.date}</td><td>{x.account}</td><td>{x.type}</td><td>{x.description}</td><td>{money(x.amount||0)}</td><td>{x.reconciled?'Yes':'No'}</td></tr>)}</tbody></table></div>}{tab==='bankAccounts'&&<div className="panel tableWrap"><table><thead><tr><th>Bank</th><th>Account number</th><th>Branch</th><th>Currency</th><th>Status</th></tr></thead><tbody>{bankAccounts.map((x:any)=><tr key={x.id}><td><strong>{x.name}</strong></td><td>{x.accountNo}</td><td>{x.branch||'—'}</td><td>{x.currency||'ZMW'}</td><td><span className="badge green">{x.status}</span></td></tr>)}{!bankAccounts.length&&<tr><td colSpan={5}><Empty text="No bank accounts registered."/></td></tr>}</tbody></table></div>}{tab==='reconcile'&&<><div className="cards"><Metric title="Unreconciled transactions" value={recon?.totalUnreconciled??bankTx.filter((x:any)=>!x.reconciled).length} icon={Bell} note="Requires review"/><Metric title="Bank accounts" value={recon?.accounts?.length??bankAccounts.length} icon={Landmark} note="Registered accounts"/></div><div className="panel tableWrap"><table><thead><tr><th>Bank account</th><th>Book balance</th><th>Reconciled</th><th>Unreconciled</th><th>Open items</th></tr></thead><tbody>{(recon?.accounts||[]).map((x:any)=><tr key={x.id}><td><strong>{x.name}</strong><span>{x.accountNo}</span></td><td>{money(x.bookBalance)}</td><td>{money(x.reconciledAmount)}</td><td>{money(x.unreconciledAmount)}</td><td><span className={'badge '+(x.unreconciledCount?'amber':'green')}>{x.unreconciledCount}</span></td></tr>)}{!(recon?.accounts||[]).length&&<tr><td colSpan={5}><Empty text="No bank accounts registered."/></td></tr>}</tbody></table></div><div className="panel tableWrap"><table><thead><tr><th>Date</th><th>Account</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{bankTx.map((x:any)=><tr key={x.id}><td>{x.date}</td><td>{x.account}</td><td>{x.description}</td><td>{x.type}</td><td>{money(x.amount||0)}</td><td><span className={'badge '+(x.reconciled?'green':'amber')}>{x.reconciled?'Reconciled':'Unreconciled'}</span>{x.reconciled&&x.statementRef&&<span>{x.statementRef} · {x.clearedDate||x.statementDate}</span>}</td><td>{!x.reconciled&&can?<button onClick={()=>{const ref=window.prompt('Bank statement reference:','');if(ref===null)return;const date=window.prompt('Statement / cleared date (YYYY-MM-DD):',x.date)||x.date;action('/api/accounting/reconcile',{id:x.id,statementRef:ref,statementDate:date,clearedDate:date})}} >Reconcile</button>:x.reconciled?(x.reconciledBy||'Completed'):'—'}</td></tr>)}{!bankTx.length&&<tr><td colSpan={7}><Empty text="No bank transactions recorded."/></td></tr>}</tbody></table></div></>}{tab==='accounts'&&<div className="panel tableWrap"><table><thead><tr><th>Code</th><th>Account</th><th>Type</th><th>Status</th></tr></thead><tbody>{accounts.map((a:any)=><tr key={a.id}><td>{a.code}</td><td>{a.name}</td><td>{a.type}</td><td><span className="badge green">{a.status}</span></td></tr>)}</tbody></table></div>}{tab==='journals'&&<div className="panel tableWrap"><table><thead><tr><th>Date</th><th>Description</th><th>Reference</th><th>Debit</th><th>Credit</th></tr></thead><tbody>{journals.map((j:any)=><tr key={j.id}><td>{j.date}</td><td>{j.description}</td><td>{j.reference||'—'}</td><td>{money(j.totalDebit||0)}</td><td>{money(j.totalCredit||0)}</td></tr>)}</tbody></table></div>}{tab==='trial'&&<div className="panel tableWrap"><table><thead><tr><th>Code</th><th>Account</th><th>Type</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>{balances.map((a:any)=><tr key={a.id}><td>{a.code}</td><td>{a.name}</td><td>{a.type}</td><td>{money(a.debit)}</td><td>{money(a.credit)}</td><td>{money(a.balance)}</td></tr>)}</tbody></table></div>}{show&&<Modal title={tab==='accounts'?'Add account':tab==='bankAccounts'?'Add bank account':tab==='cash'?'Bank transaction':'Post journal'} onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();submit()}}>{tab==='accounts'?<><label>Account code<input required value={form.code||''} onChange={e=>setForm({...form,code:e.target.value})}/></label><label>Account name<input required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Type<select value={form.type||'Asset'} onChange={e=>setForm({...form,type:e.target.value})}><option>Asset</option><option>Liability</option><option>Equity</option><option>Income</option><option>Expense</option></select></label></>:tab==='bankAccounts'?<><label>Bank name<input required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Account number<input required value={form.accountNo||''} onChange={e=>setForm({...form,accountNo:e.target.value})}/></label><label>Branch<input value={form.branch||''} onChange={e=>setForm({...form,branch:e.target.value})}/></label><label>Currency<input value={form.currency||'ZMW'} onChange={e=>setForm({...form,currency:e.target.value})}/></label></>:tab==='cash'?<><label>Account<input required value={form.account||''} onChange={e=>setForm({...form,account:e.target.value})}/></label><label>Date<input type="date" required value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Type<select value={form.type||'Deposit'} onChange={e=>setForm({...form,type:e.target.value})}><option>Deposit</option><option>Withdrawal</option></select></label><label>Description<input required value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Amount<input type="number" min="0.01" required value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})}/></label></>:<><label>Date<input type="date" required value={form.date||''} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Description<input required value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Debit account<select required value={form.debitAccount||''} onChange={e=>setForm({...form,debitAccount:e.target.value})}><option value="">Select account</option>{accounts.map((a:any)=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}</select></label><label>Credit account<select required value={form.creditAccount||''} onChange={e=>setForm({...form,creditAccount:e.target.value})}><option value="">Select account</option>{accounts.map((a:any)=><option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}</select></label><label>Amount (ZMW)<input type="number" min="0.01" required value={form.amount||''} onChange={e=>setForm({...form,amount:e.target.value})}/></label></>}<div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Save</button></div></form></Modal>}</section>}

function Suppliers({data,role,action}:any){const [show,setShow]=useState(false);const [form,setForm]=useState<any>({name:'',contact:'',taxNo:'',category:''});const can=['admin','finance','director'].includes(role);const rows=data.suppliers||[];return <section><div className="sectionTop"><div><h1>Suppliers & Procurement</h1><p>Supplier register and procurement governance workspace.</p></div>{can&&<button className="primary" onClick={()=>{setForm({name:'',contact:'',taxNo:'',category:''});setShow(true)}}>+ Supplier</button>}</div><div className="panel tableWrap"><table><thead><tr><th>Supplier</th><th>Contact</th><th>Tax / TPIN</th><th>Category</th><th>Status</th></tr></thead><tbody>{rows.map((x:any)=><tr key={x.id}><td><strong>{x.name}</strong></td><td>{x.contact||'—'}</td><td>{x.taxNo||'—'}</td><td>{x.category||'—'}</td><td><span className="badge green">{x.status}</span></td></tr>)}{!rows.length&&<tr><td colSpan={5}><Empty text="No suppliers registered yet."/></td></tr>}</tbody></table></div>{show&&<Modal title="Add supplier" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/suppliers',{...form});setShow(false)}}><label>Supplier name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Contact<input value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/></label><label>Tax / TPIN<input value={form.taxNo} onChange={e=>setForm({...form,taxNo:e.target.value})}/></label><label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Save supplier</button></div></form></Modal>}</section>}

function Payroll({data,employees,role,action}:any){const [tab,setTab]=useState('register');const [show,setShow]=useState(false);const [period,setPeriod]=useState(new Date().toISOString().slice(0,7));const [summary,setSummary]=useState<any>(null);const [summaryLoading,setSummaryLoading]=useState(false);const [form,setForm]=useState<any>({employeeId:'',period:new Date().toISOString().slice(0,7),gross:'',basicSalary:'',otherDeductions:'0'});const canPrepare=['admin','hr','finance','director'].includes(role);const canControl=['admin','finance','director'].includes(role);const canUnlock=['admin','director'].includes(role);const periods=data.payrollPeriods||[];const status=periods.find((x:any)=>x.period===period)?.status||'Open';const rows=(data||[]).filter((x:any)=>!period||x.period===period);const loadSummary=async()=>{setSummaryLoading(true);try{const r=await api.get('/api/hr/payroll/statutory-summary',{period});setSummary(r.data);}catch(e){setSummary(null)}finally{setSummaryLoading(false)}};const exportCsv=()=>{const header=['Employee','Employee No','Period','Gross','PAYE','Employee NAPSA','Employee NHIMA','Other deductions','Net','Employer NAPSA','Employer NHIMA','Employer cost','Status'];const body=rows.map((x:any)=>[x.employeeName,x.employeeNo||'',x.period,x.gross||0,x.paye||0,x.napsa||0,x.nhima||0,x.otherDeductions||0,x.net||0,x.employerNapsa||0,x.employerNhima||0,x.employerCost||0,x.status]);const csv=[header,...body].map((r:any[])=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='vsi-payroll-'+period+'.csv';a.click();URL.revokeObjectURL(url)};return <section><div className="sectionTop"><div><h1>Payroll</h1><p>Statutory payroll preparation, approval, register and period controls.</p></div><div className="rowActions">{canPrepare&&status==='Open'&&<button className="primary" onClick={()=>{setForm({employeeId:'',period,gross:'',basicSalary:'',otherDeductions:'0'});setShow(true)}}>+ Prepare payroll</button>}{tab==='register'&&rows.length>0&&<button onClick={exportCsv}>Export CSV</button>}</div></div><div className="cards"><Metric title="Gross payroll" value={money(rows.reduce((s:number,x:any)=>s+Number(x.gross||0),0))} icon={WalletCards} note={period}/><Metric title="PAYE" value={money(rows.reduce((s:number,x:any)=>s+Number(x.paye||0),0))} icon={CircleDollarSign} note="Approved records"/><Metric title="Employee NAPSA" value={money(rows.reduce((s:number,x:any)=>s+Number(x.napsa||0),0))} icon={ShieldCheck} note="5% capped contribution"/><Metric title="Net payroll" value={money(rows.reduce((s:number,x:any)=>s+Number(x.net||0),0))} icon={Users} note="After statutory deductions"/></div><div className="tabs"><button className={tab==='register'?'selected':''} onClick={()=>setTab('register')}>Payroll Register</button><button className={tab==='summary'?'selected':''} onClick={()=>{setTab('summary');loadSummary()}}>Statutory Summary</button><button className={tab==='periods'?'selected':''} onClick={()=>setTab('periods')}>Period Control</button></div><div className="panel" style={{marginBottom:16}}><div className="formGrid"><label>Payroll period<input type="month" value={period} onChange={e=>{setPeriod(e.target.value);setSummary(null)}}/></label><div><span className="eyebrow">PERIOD STATUS</span><div><span className={'badge '+(status==='Locked'?'red':'green')}>{status}</span></div></div></div></div>{tab==='register'&&<div className="panel tableWrap"><table><thead><tr><th>Employee</th><th>Period</th><th>Gross</th><th>PAYE</th><th>NAPSA</th><th>NHIMA</th><th>Other</th><th>Net</th><th>Status</th></tr></thead><tbody>{rows.map((x:any)=><tr key={x.id}><td><strong>{x.employeeName}</strong><span>{x.employeeNo||''}</span></td><td>{x.period}</td><td>{money(x.gross||0)}</td><td>{money(x.paye||0)}</td><td>{money(x.napsa||0)}</td><td>{money(x.nhima||0)}</td><td>{money(x.otherDeductions??x.deductions??0)}</td><td><strong>{money(x.net||0)}</strong></td><td><span className="rowActions">{x.status==='Approved'&&<button onClick={()=>{const w=window.open('','_blank','width=760,height=900');if(w){w.document.write('<html><head><title>VSI Payslip</title></head><body><h1>VSI Finance & HR</h1><p>PAYSLIP — '+x.period+'</p><p><b>Employee:</b> '+(x.employeeName||'')+'<br><b>Employee No:</b> '+(x.employeeNo||'')+'</p><table><tr><td>Gross salary</td><td>'+money(x.gross||0)+'</td></tr><tr><td>PAYE</td><td>'+money(x.paye||0)+'</td></tr><tr><td>NAPSA</td><td>'+money(x.napsa||0)+'</td></tr><tr><td>NHIMA</td><td>'+money(x.nhima||0)+'</td></tr><tr><td>Other deductions</td><td>'+money(x.otherDeductions??x.deductions??0)+'</td></tr><tr><td><b>NET PAY</b></td><td><b>'+money(x.net||0)+'</b></td></tr></table><p>Employer NAPSA: '+money(x.employerNapsa||0)+'<br>Employer NHIMA: '+money(x.employerNhima||0)+'<br>Employer cost: '+money(x.employerCost||0)+'</p><script>window.print()</script></body></html>');w.document.close()}}}>Payslip</button>}{x.status==='Pending'&&canPrepare?<span className="rowActions"><button onClick={()=>action('/api/approvals/payroll',{id:x.id,status:'Rejected'})}>Reject</button><button className="primary" onClick={()=>action('/api/approvals/payroll',{id:x.id,status:'Approved'})}>Approve</button></span>:<span className={'badge '+(x.status==='Approved'?'green':x.status==='Rejected'?'red':'amber')}>{x.status}</span>}</span></td></tr>)}{!rows.length&&<tr><td colSpan={9}><Empty text="No payroll records for this period."/></td></tr>}</tbody></table></div>}{tab==='summary'&&<div className="cards"><Metric title="Approved employees" value={summaryLoading?'…':summary?.employees||0} icon={Users} note={period}/><Metric title="PAYE" value={summaryLoading?'…':money(summary?.paye||0)} icon={CircleDollarSign} note="Tax withheld"/><Metric title="NAPSA total" value={summaryLoading?'…':money((summary?.employeeNapsa||0)+(summary?.employerNapsa||0))} icon={ShieldCheck} note="Employee + employer"/><Metric title="NHIMA total" value={summaryLoading?'…':money((summary?.employeeNhima||0)+(summary?.employerNhima||0))} icon={WalletCards} note="Employee + employer"/><Metric title="Employer cost" value={summaryLoading?'…':money(summary?.employerCost||0)} icon={BriefcaseBusiness} note="Gross + employer contributions"/><Metric title="Net payroll" value={summaryLoading?'…':money(summary?.net||0)} icon={BarChart3} note="Approved payroll"/></div>}{tab==='periods'&&<div className="panel tableWrap"><table><thead><tr><th>Period</th><th>Status</th><th>Locked / updated</th><th>Action</th></tr></thead><tbody>{periods.length?periods.map((x:any)=><tr key={x.id}><td>{x.period}</td><td><span className={'badge '+(x.status==='Locked'?'red':'green')}>{x.status}</span></td><td>{x.lockedAt||x.unlockedAt||'—'}</td><td><span className="rowActions">{x.status!=='Locked'&&canControl&&<button className="primary" onClick={()=>action('/api/hr/payroll/period-lock',{period:x.period})}>Lock</button>}{x.status==='Locked'&&canUnlock&&<button onClick={()=>action('/api/hr/payroll/period-unlock',{period:x.period})}>Unlock</button>}</span></td></tr>):<tr><td colSpan={4}><Empty text="No payroll periods have been locked yet."/></td></tr>}</tbody></table></div>}{show&&<Modal title="Prepare statutory payroll" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/hr/payroll',{...form,gross:Number(form.gross),basicSalary:Number(form.basicSalary||form.gross),otherDeductions:Number(form.otherDeductions||0)});setShow(false)}}><label>Employee<select required value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}><option value="">Select employee</option>{employees.map((x:any)=><option key={x.id} value={x.id}>{x.name} — {x.employeeNo}</option>)}</select></label><label>Period<input type="month" required value={form.period} onChange={e=>setForm({...form,period:e.target.value})}/></label><label>Gross salary (ZMW)<input type="number" min="0.01" required value={form.gross} onChange={e=>setForm({...form,gross:e.target.value})}/></label><label>Basic salary (ZMW)<input type="number" min="0" required value={form.basicSalary} onChange={e=>setForm({...form,basicSalary:e.target.value})}/></label><label>Other deductions (ZMW)<input type="number" min="0" value={form.otherDeductions} onChange={e=>setForm({...form,otherDeductions:e.target.value})}/></label><div className="wide"><p>Statutory deductions are calculated by the system: PAYE, NAPSA and NHIMA. The record remains pending until approved by an authorised reviewer.</p></div><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Calculate & save</button></div></form></Modal>}</section>}

function Contracts({data,employees,role,action}:any){const [show,setShow]=useState(false);const today=new Date();const expiring=data.filter((x:any)=>x.endDate).map((x:any)=>({...x,daysLeft:Math.ceil((new Date(x.endDate).getTime()-today.getTime())/86400000)})).filter((x:any)=>x.daysLeft>=0&&x.daysLeft<=90).sort((a:any,b:any)=>a.daysLeft-b.daysLeft);const [form,setForm]=useState<any>({employeeId:'',type:'Employment',startDate:'',endDate:'',salary:'',notes:''});const can=['admin','hr','director'].includes(role);return <section><div className="sectionTop"><div><h1>Employment Contracts</h1><p>Track contract terms, dates, status and renewal information.</p></div>{can&&<button className="primary" onClick={()=>setShow(true)}>+ New contract</button>}</div><div className="panel tableWrap"><table><thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Salary</th><th>Status</th></tr></thead><tbody>{data.map((x:any)=><tr key={x.id}><td>{x.employeeName||employees.find((e:any)=>e.id===x.employeeId)?.name||x.employeeId}</td><td>{x.type}</td><td>{x.startDate}</td><td>{x.endDate||'Open-ended'}</td><td>{x.salary?money(x.salary):'—'}</td><td><span className="badge green">{x.status}</span></td></tr>)}{!data.length&&<tr><td colSpan={6}><Empty text="No employment contracts recorded yet."/></td></tr>}</tbody></table></div>{show&&<Modal title="New employment contract" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();const employee=employees.find((x:any)=>x.id===form.employeeId);action('/api/hr/contracts',{...form,employeeName:employee?.name||''});setShow(false)}}><label>Employee<select required value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}><option value="">Select employee</option>{employees.map((x:any)=><option key={x.id} value={x.id}>{x.name} — {x.employeeNo}</option>)}</select></label><label>Contract type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Employment</option><option>Fixed-term</option><option>Consultancy</option><option>Volunteer</option><option>Internship</option></select></label><label>Start date<input type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>End date<input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></label><label>Salary (ZMW)<input type="number" min="0" value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})}/></label><label className="wide">Notes<input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Save contract</button></div></form></Modal>}</section>}
function Procurement({data,role,action}:any){const [show,setShow]=useState(false);const [form,setForm]=useState<any>({description:'',project:'',vendor:'',amount:'',justification:''});return <section><div className="sectionTop"><div><h1>Procurement</h1><p>Requests, supplier details and approval controls.</p></div><button className="primary" onClick={()=>setShow(true)}>+ Request procurement</button></div><div className="panel tableWrap"><table><thead><tr><th>Request</th><th>Project</th><th>Vendor</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.map((x:any)=><tr key={x.id}><td><strong>{x.description}</strong><span>{x.requestedBy}</span></td><td>{x.project}</td><td>{x.vendor||'—'}</td><td>{money(x.amount)}</td><td><span className={'badge '+(x.status==='Approved'?'green':x.status==='Rejected'?'red':'amber')}>{x.status}</span></td><td>{x.status==='Pending'&&['admin','finance','director'].includes(role)&&<span className="rowActions"><button onClick={()=>action('/api/procurement/approve',{id:x.id,status:'Rejected'})}>Reject</button><button className="primary" onClick={()=>action('/api/procurement/approve',{id:x.id,status:'Approved'})}>Approve</button></span>}</td></tr>)}</tbody></table></div>{show&&<Modal title="Procurement request" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/procurement',form);setShow(false)}}><label className="wide">Description<input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Project / donor code<input required value={form.project} onChange={e=>setForm({...form,project:e.target.value})}/></label><label>Vendor / supplier<input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})}/></label><label>Amount (ZMW)<input type="number" min="0.01" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label className="wide">Justification<input value={form.justification} onChange={e=>setForm({...form,justification:e.target.value})}/></label><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Submit request</button></div></form></Modal>}</section>}
function Projects({data,role,action}:any){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState<any>({code:'',name:'',donor:'',budget:'',endDate:'',fundingType:'Unrestricted',restrictedPurpose:''});
  const can=['admin','finance','director'].includes(role);
  return <section>
    <div className="sectionTop">
      <div><h1>Projects & Donors</h1><p>Code transactions to the programme or donor they belong to.</p></div>
      {can&&<button className="primary" onClick={()=>setShow(true)}>+ Add project</button>}
    </div>
    <div className="cards">{data.map((x:any)=><Metric key={x.id} title={x.code} value={money(x.budget||0)} icon={BriefcaseBusiness} note={(x.donor||'Internal')+' · '+(x.fundingType||'Unrestricted')}/>)}</div>
    {show&&<Modal title="New project / donor code" onClose={()=>setShow(false)}>
      <form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/projects',form);setShow(false)}}>
        <label>Code<input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></label>
        <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Donor<input value={form.donor} onChange={e=>setForm({...form,donor:e.target.value})}/></label>
        <label>Budget (ZMW)<input type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label>
        <label>Funding type<select value={form.fundingType} onChange={e=>setForm({...form,fundingType:e.target.value})}><option>Unrestricted</option><option>Restricted</option></select></label>
        {form.fundingType==='Restricted'&&<label className="wide">Restricted funding purpose<input required value={form.restrictedPurpose} onChange={e=>setForm({...form,restrictedPurpose:e.target.value})} placeholder="State the approved purpose for this restricted fund"/></label>}
        <label>End date<input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></label>
        <div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Create project</button></div>
      </form>
    </Modal>}
  </section>
}
function Assets({data,role,action}:any){const [show,setShow]=useState(false);const [form,setForm]=useState<any>({assetTag:'',name:'',category:'Equipment',location:'',custodian:'',value:''});const can=['admin','finance','director'].includes(role);return <section><div className="sectionTop"><div><h1>Assets</h1><p>Track organisational property, custody and value.</p></div>{can&&<button className="primary" onClick={()=>setShow(true)}>+ Register asset</button>}</div><div className="panel tableWrap"><table><thead><tr><th>Asset tag</th><th>Asset</th><th>Category</th><th>Location</th><th>Custodian</th><th>Value</th><th>Status</th></tr></thead><tbody>{data.map((x:any)=><tr key={x.id}><td>{x.assetTag}</td><td><strong>{x.name}</strong></td><td>{x.category}</td><td>{x.location||'—'}</td><td>{x.custodian||'—'}</td><td>{money(x.value||0)}</td><td><span className="badge green">{x.status}</span></td></tr>)}</tbody></table></div>{show&&<Modal title="Register asset" onClose={()=>setShow(false)}><form className="formGrid" onSubmit={e=>{e.preventDefault();action('/api/assets',form);setShow(false)}}><label>Asset tag<input required value={form.assetTag} onChange={e=>setForm({...form,assetTag:e.target.value})}/></label><label>Asset name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>Value (ZMW)<input type="number" min="0" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></label><label>Location<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Custodian<input value={form.custodian} onChange={e=>setForm({...form,custodian:e.target.value})}/></label><div className="formActions"><button type="button" onClick={()=>setShow(false)}>Cancel</button><button className="primary">Register asset</button></div></form></Modal>}</section>}
function Modal({ title, onClose, children }: any) {
  return (
    <div className="modalBack">
      <div className="modal">
        <div className="modalHead">
          <h3>{title}</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}