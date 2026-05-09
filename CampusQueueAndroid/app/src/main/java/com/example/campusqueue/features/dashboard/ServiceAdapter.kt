package com.example.campusqueue.features.dashboard

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.campusqueue.R
import com.example.campusqueue.network.models.Service

class ServiceAdapter(
    private var services: List<Service>,
    private val activeQueueServiceId: Int?,
    private val onJoinClicked: (Service) -> Unit
) : RecyclerView.Adapter<ServiceAdapter.ViewHolder>() {

    private var currentActiveId = activeQueueServiceId

    fun updateData(newServices: List<Service>, newActiveId: Int?) {
        services = newServices
        currentActiveId = newActiveId
        notifyDataSetChanged()
    }

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvIcon: TextView = view.findViewById(R.id.tvIcon)
        val tvName: TextView = view.findViewById(R.id.tvName)
        val tvWaitTime: TextView = view.findViewById(R.id.tvWaitTime)
        val tvQueueCount: TextView = view.findViewById(R.id.tvQueueCount)
        val btnJoin: Button = view.findViewById(R.id.btnJoin)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_service, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val svc = services[position]
        holder.tvIcon.text = svc.icon ?: "🏛"
        holder.tvName.text = svc.name
        holder.tvWaitTime.text = "Wait: ${svc.wait_time_min} min"
        holder.tvQueueCount.text = "In Queue: ${svc.queue_count}"
        
        val isMyQueue = currentActiveId == svc.id
        
        if (isMyQueue) {
            holder.btnJoin.text = "✓ Joined"
            holder.btnJoin.isEnabled = false
            try {
                holder.btnJoin.setBackgroundColor(Color.parseColor("#4caf50")) // green
            } catch(e: Exception) {}
        } else {
            holder.btnJoin.text = "Join Queue"
            holder.btnJoin.isEnabled = currentActiveId == null // disable if they joined another queue
            try {
                val color = svc.accent_color ?: "#2563eb"
                holder.btnJoin.setBackgroundColor(Color.parseColor(color))
            } catch(e: Exception) {
                holder.btnJoin.setBackgroundColor(Color.parseColor("#2563eb"))
            }
        }
        
        holder.btnJoin.setOnClickListener {
            onJoinClicked(svc)
        }
    }

    override fun getItemCount() = services.size
}
