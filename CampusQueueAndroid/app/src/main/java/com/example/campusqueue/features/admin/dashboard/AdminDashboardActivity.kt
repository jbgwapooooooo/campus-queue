package com.example.campusqueue.features.admin.dashboard

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.campusqueue.R
import com.example.campusqueue.features.auth.login.LoginActivity
import com.example.campusqueue.network.models.QueueEntry
import com.example.campusqueue.utils.SessionManager

class AdminDashboardActivity : AppCompatActivity(), AdminDashboardContract.View {

    private lateinit var presenter: AdminDashboardPresenter
    private lateinit var rvAdminQueue: RecyclerView
    private lateinit var adapter: AdminQueueAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmptyState: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_dashboard)
        
        presenter = AdminDashboardPresenter(this)
        
        progressBar = findViewById(R.id.progressBar)
        tvEmptyState = findViewById(R.id.tvEmptyState)
        rvAdminQueue = findViewById(R.id.rvAdminQueue)
        
        rvAdminQueue.layoutManager = LinearLayoutManager(this)
        adapter = AdminQueueAdapter(emptyList(),
            onCallClicked = { entry -> presenter.callUser(entry.id) },
            onResolveClicked = { entry -> presenter.resolveUser(entry.id) }
        )
        rvAdminQueue.adapter = adapter
        
        val logoutAction = { view: View ->
            SessionManager.clear()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
        
        findViewById<Button>(R.id.btnSignOut).setOnClickListener(logoutAction)
        findViewById<Button>(R.id.btnSignOutBottom).setOnClickListener(logoutAction)
    }

    override fun onResume() {
        super.onResume()
        presenter.fetchDashboard()
    }

    override fun showLoading() { progressBar.visibility = View.VISIBLE }
    override fun hideLoading() { progressBar.visibility = View.GONE }
    override fun showError(message: String) { Toast.makeText(this, message, Toast.LENGTH_SHORT).show() }

    override fun onQueueEntriesLoaded(entries: List<QueueEntry>) {
        if (entries.isEmpty()) {
            tvEmptyState.visibility = View.VISIBLE
            rvAdminQueue.visibility = View.GONE
        } else {
            tvEmptyState.visibility = View.GONE
            rvAdminQueue.visibility = View.VISIBLE
            adapter.updateData(entries)
        }
    }

    override fun onActionSuccess(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
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
