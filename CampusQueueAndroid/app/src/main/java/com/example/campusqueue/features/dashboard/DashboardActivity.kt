package com.example.campusqueue.features.dashboard
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.campusqueue.R
import com.example.campusqueue.features.auth.login.LoginActivity
import com.example.campusqueue.features.profile.view.ProfileActivity
import com.example.campusqueue.network.models.QueueEntry
import com.example.campusqueue.network.models.Service
import com.example.campusqueue.utils.SessionManager

class DashboardActivity : AppCompatActivity(), DashboardContract.View {
    private lateinit var presenter: DashboardPresenter
    private lateinit var progressBar: ProgressBar
    private lateinit var rvServices: RecyclerView
    private lateinit var llActiveQueue: LinearLayout
    private lateinit var tvActiveQueueService: TextView
    private lateinit var tvActiveQueuePosition: TextView
    
    private lateinit var adapter: ServiceAdapter
    private var cachedServices: List<Service> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)
        presenter = DashboardPresenter(this)
        
        progressBar = findViewById(R.id.progressBar)
        rvServices = findViewById(R.id.rvServices)
        llActiveQueue = findViewById(R.id.llActiveQueue)
        tvActiveQueueService = findViewById(R.id.tvActiveQueueService)
        tvActiveQueuePosition = findViewById(R.id.tvActiveQueuePosition)
        
        rvServices.layoutManager = LinearLayoutManager(this)
        adapter = ServiceAdapter(emptyList(), null) { service ->
            presenter.joinQueue(service.id, service.queue_count)
        }
        rvServices.adapter = adapter
        
        findViewById<Button>(R.id.btnProfile).setOnClickListener { startActivity(Intent(this, ProfileActivity::class.java)) }
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            SessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        presenter.fetchDashboard()
    }
    
    override fun showLoading() { progressBar.visibility = View.VISIBLE }
    override fun hideLoading() { progressBar.visibility = View.GONE }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }
    
    override fun onServicesLoaded(services: List<Service>) {
        cachedServices = services
        adapter.updateData(services, null)
    }
    
    override fun onActiveQueueLoaded(queueEntry: QueueEntry?) {
        if (queueEntry != null) {
            llActiveQueue.visibility = View.VISIBLE
            tvActiveQueueService.text = "In queue: ${queueEntry.services?.name ?: "Service"}"
            tvActiveQueuePosition.text = "#${queueEntry.position}"
        } else {
            llActiveQueue.visibility = View.GONE
        }
        adapter.updateData(cachedServices, queueEntry?.service_id)
    }
    
    override fun onQueueJoined() {
        Toast.makeText(this, "Joined queue!", Toast.LENGTH_SHORT).show()
    }
    
    override fun onUnauthorized() {
        SessionManager.clear()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
    override fun onDestroy() {
        presenter.onDestroy()
        super.onDestroy()
    }
}
